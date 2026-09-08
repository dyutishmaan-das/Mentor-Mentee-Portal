import express from 'express';

import {
  importStudentsFromExcel,
} from '../controllers/studentImportController.js';

import uploadExcel from '../middleware/uploadExcel.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

/*
|--------------------------------------------------------------------------
| IMPORT STUDENTS FROM EXCEL
|--------------------------------------------------------------------------
|
| POST /api/students/import
|
| Request:
|
| multipart/form-data
|
| Field name:
|
| file
|
*/

router.post(
  '/import',
  protect,
  uploadExcel.single('file'),
  importStudentsFromExcel,
);

export default router;