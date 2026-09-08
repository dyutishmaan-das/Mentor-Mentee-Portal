import express from 'express';

import {
  list,
  get,
  getMyProfile,
  create,
  update,
  assignMentor,
} from '../controllers/studentController.js';

import {
  importStudentsFromExcel,
} from '../controllers/studentImportController.js';

import uploadExcel from '../middleware/uploadExcel.js';

import {
  authenticate,
  authorize,
} from '../middleware/auth.js';

const router = express.Router();

/*
|--------------------------------------------------------------------------
| STUDENT LIST
|--------------------------------------------------------------------------
|
| GET /api/students
|
*/

router.get(
  '/',
  authenticate,
  list,
);

/*
|--------------------------------------------------------------------------
| MY PROFILE
|--------------------------------------------------------------------------
|
| GET /api/students/me
|
*/

router.get(
  '/me',
  authenticate,
  getMyProfile,
);

/*
|--------------------------------------------------------------------------
| EXCEL IMPORT
|--------------------------------------------------------------------------
|
| POST /api/students/import
|
| Only ADMIN / HOD.
|
*/

router.post(
  '/import',
  authenticate,
  authorize('ADMIN', 'HOD'),
  uploadExcel.single('file'),
  importStudentsFromExcel,
);

/*
|--------------------------------------------------------------------------
| CREATE STUDENT
|--------------------------------------------------------------------------
|
| POST /api/students
|
*/

router.post(
  '/',
  authenticate,
  create,
);

/*
|--------------------------------------------------------------------------
| ASSIGN MENTOR
|--------------------------------------------------------------------------
|
| POST /api/students/:id/mentor
|
*/

router.post(
  '/:id/mentor',
  authenticate,
  assignMentor,
);

/*
|--------------------------------------------------------------------------
| GET SINGLE STUDENT
|--------------------------------------------------------------------------
|
| GET /api/students/:id
|
*/

router.get(
  '/:id',
  authenticate,
  get,
);

/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
|--------------------------------------------------------------------------
|
| PATCH /api/students/:id
|
*/

router.patch(
  '/:id',
  authenticate,
  update,
);

export default router;