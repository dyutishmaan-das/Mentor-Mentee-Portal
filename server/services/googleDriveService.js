import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

let driveClientInstance = null;
const folderCache = new Map();

/**
 * Check if Google Drive credentials are fully configured
 */
export function isDriveConfigured() {
    const hasServiceAccountJson = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const hasClientCredentials = Boolean(
        process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY
    );
    const hasFolderId = Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID);

    return (hasServiceAccountJson || hasClientCredentials) && hasFolderId;
}

/**
 * Get authenticated Google Drive client instance
 */
function getDriveClient() {
    if (driveClientInstance) {
        return driveClientInstance;
    }

    let auth = null;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
            let keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY.trim();
            if (!keyJson.startsWith('{')) {
                // Try base64 decode if encoded
                keyJson = Buffer.from(keyJson, 'base64').toString('utf-8');
            }
            const credentials = JSON.parse(keyJson);
            auth = new google.auth.JWT(
                credentials.client_email,
                null,
                credentials.private_key,
                SCOPES
            );
        } catch (err) {
            console.error('[GoogleDriveService] Error parsing GOOGLE_SERVICE_ACCOUNT_KEY:', err.message);
        }
    }

    if (!auth && process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
        const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL.trim();
        let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        auth = new google.auth.JWT(
            clientEmail,
            null,
            privateKey,
            SCOPES
        );
    }

    if (!auth) {
        return null;
    }

    driveClientInstance = google.drive({ version: 'v3', auth });
    return driveClientInstance;
}

/**
 * Find or create a subfolder in Google Drive
 */
async function getOrCreateSubfolder(drive, subfolderName, parentFolderId) {
    if (!subfolderName || !parentFolderId) return parentFolderId;

    const cacheKey = `${parentFolderId}_${subfolderName}`;
    if (folderCache.has(cacheKey)) {
        return folderCache.get(cacheKey);
    }

    try {
        const query = `name = '${subfolderName}' and '${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const listRes = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (listRes.data.files && listRes.data.files.length > 0) {
            const folderId = listRes.data.files[0].id;
            folderCache.set(cacheKey, folderId);
            return folderId;
        }

        // Create the folder
        const createRes = await drive.files.create({
            requestBody: {
                name: subfolderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId],
            },
            fields: 'id',
        });

        const newFolderId = createRes.data.id;
        folderCache.set(cacheKey, newFolderId);
        return newFolderId;
    } catch (err) {
        console.warn(`[GoogleDriveService] Subfolder check failed for "${subfolderName}", using parent folder:`, err.message);
        return parentFolderId;
    }
}

/**
 * Upload a file to Google Drive and return direct public image URL
 * @param {Object} params
 * @param {string} [params.filePath] - Absolute path to local file
 * @param {Buffer} [params.buffer] - File buffer (optional alternative to filePath)
 * @param {string} params.fileName - Name of file to store in Drive
 * @param {string} params.mimeType - Mime type of the file
 * @param {string} [params.subfolder] - Subfolder name (e.g. 'students', 'parents', 'faculty')
 * @returns {Promise<{fileId: string, directUrl: string, webViewLink: string}>}
 */
export async function uploadToGoogleDrive({ filePath, buffer, fileName, mimeType, subfolder }) {
    const drive = getDriveClient();
    if (!drive) {
        throw new Error('Google Drive service is not configured');
    }

    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const targetFolderId = await getOrCreateSubfolder(drive, subfolder, rootFolderId);

    let fileMediaBody = null;
    if (filePath && fs.existsSync(filePath)) {
        fileMediaBody = fs.createReadStream(filePath);
    } else if (buffer) {
        fileMediaBody = Readable.from(buffer);
    } else {
        throw new Error('No valid file stream or buffer provided for Google Drive upload');
    }

    const fileMetadata = {
        name: fileName || `file_${Date.now()}`,
        parents: targetFolderId ? [targetFolderId] : [],
    };

    const media = {
        mimeType: mimeType || 'image/jpeg',
        body: fileMediaBody,
    };

    // 1. Create file on Google Drive
    const uploadRes = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = uploadRes.data.id;

    // 2. Set public read permission so photos display directly in browser
    try {
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
    } catch (permErr) {
        console.warn('[GoogleDriveService] Warning creating public permission:', permErr.message);
    }

    // High performance direct CDN URL for images hosted on Google Drive
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    return {
        fileId,
        directUrl,
        webViewLink: uploadRes.data.webViewLink,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
    };
}

/**
 * Delete a file from Google Drive by ID or URL
 */
export async function deleteFromGoogleDrive(fileIdOrUrl) {
    if (!fileIdOrUrl) return false;

    const drive = getDriveClient();
    if (!drive) return false;

    let fileId = fileIdOrUrl;
    if (fileIdOrUrl.includes('/d/')) {
        const match = fileIdOrUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
    } else if (fileIdOrUrl.includes('id=')) {
        const match = fileIdOrUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
    }

    try {
        await drive.files.delete({ fileId: fileId });
        return true;
    } catch (err) {
        console.warn(`[GoogleDriveService] Failed to delete file (${fileId}) from Drive:`, err.message);
        return false;
    }
}

export default {
    isDriveConfigured,
    uploadToGoogleDrive,
    deleteFromGoogleDrive,
};
