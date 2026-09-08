import multer from 'multer';

/*
|--------------------------------------------------------------------------
| STORE FILE IN MEMORY
|--------------------------------------------------------------------------
|
| The Excel file will be available as:
|
| req.file.buffer
|
| This is what studentImportController.js expects.
|
*/

const storage = multer.memoryStorage();

/*
|--------------------------------------------------------------------------
| ALLOWED FILE TYPES
|--------------------------------------------------------------------------
*/

const allowedMimeTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

/*
|--------------------------------------------------------------------------
| FILE FILTER
|--------------------------------------------------------------------------
*/

const fileFilter = (_req, file, cb) => {
  const isExcelMimeType =
    allowedMimeTypes.includes(file.mimetype);

  const isExcelExtension =
    /\.(xlsx|xls)$/i.test(file.originalname);

  if (isExcelMimeType || isExcelExtension) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      'Only Excel files (.xlsx or .xls) are allowed',
    ),
    false,
  );
};

/*
|--------------------------------------------------------------------------
| MULTER CONFIGURATION
|--------------------------------------------------------------------------
*/

const uploadExcel = multer({
  storage,

  fileFilter,

  limits: {
    /*
     * Maximum Excel file size:
     * 10 MB
     */
    fileSize: 10 * 1024 * 1024,
  },
});

export default uploadExcel;