# 🔢 3-ATTEMPT LIMIT FOR STUDENT PHOTO UPLOADS - COMPLETE

**Date:** 2026-09-06  
**Time:** 11:13 UTC  
**Feature:** Students limited to 3 attempts for uploading photos
**Status:** ✅ FULLY IMPLEMENTED

---

## 🎯 FEATURE OVERVIEW

Students (MENTEE role) are now limited to **3 attempts** to upload their photos. After 3 attempts, they must contact their mentor or admin for assistance.

---

## ✅ WHAT WAS IMPLEMENTED

### 1. ✅ Database Tracking (`models/Student.js`)

**New Fields Added:**
```javascript
// Photo Upload Tracking
photoUploadAttempts: { type: Number, default: 0, max: 3 },
photoUploadHistory: [{
    uploadedAt: { type: Date },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    photosUploaded: [String], // ['studentPhoto', 'fatherPhoto', etc.]
}]
```

**Features:**
- ✅ Tracks number of upload attempts (max 3)
- ✅ Maintains history of all uploads with timestamps
- ✅ Records which user performed the upload
- ✅ Logs which specific photos were uploaded each time

---

### 2. ✅ Backend Enforcement (`controllers/resourceController.js`)

**Validation Logic:**
```javascript
// Check if user is a student (MENTEE)
const isStudent = req.user.role === 'MENTEE';

if (isStudent) {
    // 1. Check if uploading to own profile only
    if (student.userId && student.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You can only upload photos to your own profile');
    }

    // 2. Check 3-attempt limit
    if (student.photoUploadAttempts >= 3) {
        throw new ApiError(403, 'Photo upload limit reached. You have used all 3 attempts. Please contact your mentor or admin for assistance.');
    }
}

// 3. Increment counter after successful upload
if (isStudent) {
    student.photoUploadAttempts += 1;
    
    // Add to history
    student.photoUploadHistory.push({
        uploadedAt: new Date(),
        uploadedBy: req.user._id,
        photosUploaded: uploadedPhotos,
    });
}
```

**Features:**
- ✅ Only applies to MENTEE role (students)
- ✅ Students can only upload to their own profile
- ✅ Blocks upload after 3 attempts
- ✅ Clear error message when limit reached
- ✅ Tracks each attempt with full details
- ✅ Mentors/Admins have unlimited attempts

---

### 3. ✅ Frontend Display (`client/app.js`)

**UI Updates:**
```javascript
// Show remaining attempts in success message
if (result.data.remainingAttempts !== undefined) {
    uploadStatus.textContent = `✓ Upload complete! ${result.data.remainingAttempts} attempt(s) remaining.`;
    
    // Color coding based on remaining attempts
    if (result.data.remainingAttempts === 1) {
        uploadStatus.style.color = 'orange'; // Warning
    } else if (result.data.remainingAttempts === 0) {
        uploadStatus.style.color = 'red'; // Critical
        btnUploadPhotos.disabled = true;
        btnUploadPhotos.textContent = 'Upload Limit Reached';
    } else {
        uploadStatus.style.color = 'green'; // Success
    }
}
```

**Features:**
- ✅ Shows remaining attempts after each upload
- ✅ Color-coded warnings (green → orange → red)
- ✅ Disables upload button after 3 attempts
- ✅ Clear visual feedback for students

---

## 🔐 ROLE-BASED BEHAVIOR

| Role | Upload Limit | Can Upload For | Notes |
|------|--------------|----------------|-------|
| **MENTEE (Student)** | ✅ **3 attempts** | Own profile only | Counter increments each upload |
| **MENTOR** | ❌ Unlimited | Assigned mentees | No limit, counter not affected |
| **HOD** | ❌ Unlimited | All students | No limit, counter not affected |
| **ADMIN** | ❌ Unlimited | All students | No limit, counter not affected |
| **ACADEMIC_FACULTY** | ❌ No access | None | Cannot upload photos |
| **OTHER_FACULTY** | ❌ No access | None | Cannot upload photos |

---

## 📊 ATTEMPT TRACKING

### Attempt 1 (First Upload)
```
Status: ✅ Success
Message: "Photos uploaded successfully. 2 attempt(s) remaining."
Color: Green
Button: Enabled
```

### Attempt 2 (Second Upload)
```
Status: ✅ Success
Message: "Photos uploaded successfully. 1 attempt(s) remaining."
Color: Orange (Warning)
Button: Enabled
```

### Attempt 3 (Final Upload)
```
Status: ✅ Success
Message: "Photos uploaded successfully. 0 attempt(s) remaining."
Color: Red (Critical)
Button: Disabled
Button Text: "Upload Limit Reached"
```

### Attempt 4 (Blocked)
```
Status: ❌ Blocked
HTTP: 403 Forbidden
Error: "Photo upload limit reached. You have used all 3 attempts. Please contact your mentor or admin for assistance."
```

---

## 🧪 TESTING SCENARIOS

### Test 1: Student First Upload
**Steps:**
1. Log in as student: `230101001` / `student123`
2. Navigate to "My Profile"
3. Upload 4 photos
4. Submit

**Expected Result:**
```
✅ Successfully uploaded 4 photo(s)!
✅ Upload complete! 2 attempt(s) remaining.
Status color: Green
Upload button: Enabled
```

---

### Test 2: Student Second Upload (Replace Photos)
**Steps:**
1. Same student, already uploaded once
2. Select different photos
3. Upload again

**Expected Result:**
```
✅ Photos uploaded successfully. 1 attempt(s) remaining.
Status color: Orange (Warning)
Upload button: Enabled
```

---

### Test 3: Student Third Upload (Final Attempt)
**Steps:**
1. Same student, already uploaded twice
2. Upload photos again

**Expected Result:**
```
✅ Photos uploaded successfully. 0 attempt(s) remaining.
Status color: Red
Upload button: Disabled
Button text: "Upload Limit Reached"
```

---

### Test 4: Student Fourth Upload (Blocked)
**Steps:**
1. Same student, already used all 3 attempts
2. Try to upload again

**Expected Result:**
```
❌ Error: Photo upload limit reached. You have used all 3 attempts. Please contact your mentor or admin for assistance.
HTTP Status: 403 Forbidden
```

---

### Test 5: Mentor Uploads for Student (Unlimited)
**Steps:**
1. Log in as mentor: `mentor@demo.edu` / `demo123`
2. Select a mentee
3. Upload photos multiple times

**Expected Result:**
```
✅ Photos uploaded successfully.
No attempt counter shown
No limit enforced
Mentor can upload unlimited times
```

---

### Test 6: Admin Resets Student Photos (Unlimited)
**Steps:**
1. Log in as admin: `admin@mentormentee.local` / `Admin@12345`
2. Select student who used all 3 attempts
3. Upload new photos

**Expected Result:**
```
✅ Photos uploaded successfully.
Admin can upload without restrictions
Student's counter is NOT incremented
```

---

## 📝 DATABASE STRUCTURE

### Student Document After 3 Uploads:
```javascript
{
  rollNo: "230101001",
  name: "Student Name",
  photoUploadAttempts: 3,
  photoUploadHistory: [
    {
      uploadedAt: "2026-09-06T10:30:00.000Z",
      uploadedBy: ObjectId("..."), // Student's user ID
      photosUploaded: ["studentPhoto", "fatherPhoto", "motherPhoto", "guardianPhoto"]
    },
    {
      uploadedAt: "2026-09-06T11:00:00.000Z",
      uploadedBy: ObjectId("..."),
      photosUploaded: ["studentPhoto"] // Only replaced student photo
    },
    {
      uploadedAt: "2026-09-06T11:10:00.000Z",
      uploadedBy: ObjectId("..."),
      photosUploaded: ["fatherPhoto", "motherPhoto"] // Replaced parent photos
    }
  ],
  photoUrl: "/uploads/students/studentPhoto-1725615400000-abc.jpg",
  parentFatherPhotoUrl: "/uploads/parents/fatherPhoto-1725615600000-def.jpg",
  parentMotherPhotoUrl: "/uploads/parents/motherPhoto-1725615600000-ghi.jpg",
  guardianPhotoUrl: "/uploads/guardians/guardianPhoto-1725615000000-jkl.jpg"
}
```

---

## 🔓 HOW TO RESET ATTEMPTS (Admin/Mentor)

### Method 1: Direct Database Update (Admin Only)
```javascript
// In MongoDB Compass or via API
db.students.updateOne(
  { rollNo: "230101001" },
  { 
    $set: { 
      photoUploadAttempts: 0,
      photoUploadHistory: []
    }
  }
);
```

### Method 2: Future Admin Panel Feature
Could add an admin endpoint to reset attempts:
```javascript
// Future feature (not yet implemented)
PUT /api/admin/students/:rollNo/reset-photo-attempts
```

---

## 💡 RATIONALE

### Why 3 Attempts?

1. **Prevents Abuse:** Stops students from repeatedly uploading/changing photos
2. **Encourages Quality:** Students think carefully before uploading
3. **Storage Management:** Limits unnecessary file storage
4. **Quality Control:** Forces students to verify photos before upload
5. **Professional Standard:** Real-world systems have upload limits

### Why Mentors/Admins Are Unlimited?

- ✅ They help students fix issues
- ✅ They manage profiles for absent students
- ✅ They perform administrative corrections
- ✅ They need flexibility for legitimate updates

---

## 🎨 UI VISUAL FEEDBACK

### Success Message Evolution:

**After 1st Upload:**
```
┌─────────────────────────────────────────────────┐
│ ✓ Upload complete! 2 attempt(s) remaining.     │ (Green)
└─────────────────────────────────────────────────┘
```

**After 2nd Upload:**
```
┌─────────────────────────────────────────────────┐
│ ✓ Upload complete! 1 attempt(s) remaining.     │ (Orange - Warning)
└─────────────────────────────────────────────────┘
```

**After 3rd Upload:**
```
┌─────────────────────────────────────────────────┐
│ ✓ Upload complete! No more attempts remaining. │ (Red - Critical)
└─────────────────────────────────────────────────┘
[Upload Limit Reached] (Button Disabled)
```

---

## ✅ FILES MODIFIED

### Backend:
1. **`models/Student.js`** - Added tracking fields
   - `photoUploadAttempts: Number (max 3)`
   - `photoUploadHistory: Array`

2. **`controllers/resourceController.js`** - Enforced limit
   - Check student role
   - Validate attempt count
   - Increment counter
   - Log upload history

### Frontend:
3. **`client/app.js`** - Display attempts
   - Show remaining attempts
   - Color-coded warnings
   - Disable button after 3 attempts

---

## 🚦 DEPLOYMENT CHECKLIST

- ✅ Database schema updated with new fields
- ✅ Backend validation enforces 3-attempt limit
- ✅ Frontend displays remaining attempts
- ✅ Error messages are user-friendly
- ✅ Mentors/Admins have unlimited access
- ✅ Students restricted to own profiles
- ✅ Upload history tracked for auditing
- ✅ Visual feedback (color coding) implemented

---

## 🎉 SUMMARY

### What Students Experience:
1. Upload photos (Attempt 1/3) → ✅ Success, 2 remaining
2. Upload photos (Attempt 2/3) → ⚠️ Success, 1 remaining
3. Upload photos (Attempt 3/3) → 🚨 Success, 0 remaining, button disabled
4. Try upload (Blocked) → ❌ Error: "Contact mentor or admin"

### What Mentors/Admins Experience:
- Upload photos → ✅ Success (no limit, no counter)
- Can upload unlimited times
- Can help students who reached limit

---

## 📋 BUSINESS RULES

| Rule | Implementation |
|------|----------------|
| Students: 3 attempts max | ✅ Enforced in backend |
| Students: Own profile only | ✅ Validated in controller |
| Mentors: Unlimited uploads | ✅ Role check bypasses limit |
| Admins: Unlimited uploads | ✅ Role check bypasses limit |
| Track upload history | ✅ Saved to database |
| Show remaining attempts | ✅ Displayed in UI |
| Disable after 3 attempts | ✅ Button disabled |

---

## 🎓 USER GUIDANCE

### For Students:
> **Important:** You have only 3 attempts to upload your photos. Make sure:
> - Photos are under 500KB
> - Photos are clear and properly lit
> - All 4 photos are ready before uploading
> - Photos meet quality standards
> 
> After 3 attempts, contact your mentor or admin for help.

### For Mentors:
> If a student reaches the upload limit:
> 1. Ask them to share photos via email
> 2. Log in and upload photos on their behalf
> 3. You have unlimited upload attempts
> 4. Or contact admin to reset their counter

---

*Implementation Completed: 2026-09-06 at 11:13 UTC*  
*Status: ✅ PRODUCTION-READY*  
*Files Modified: 3 (Student.js, resourceController.js, app.js)*  
*Feature: FULLY FUNCTIONAL*
