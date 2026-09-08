import XLSX from 'xlsx';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { audit } from '../services/auditService.js';

/*
|--------------------------------------------------------------------------
| PROGRAM VALUES
|--------------------------------------------------------------------------
|
| These MUST match Student.js exactly.
|
*/

const PROGRAMS = [
  'B.Tech.-CSE',
  'B.Tech.-AI/ML',
  'B.Tech.-CSE-IoT',
  'B.Tech.-CSE-DS',
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function normalize(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  return String(value).trim();
}

function numberValue(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return undefined;
  }

  const number = Number(
    String(value)
      .replace('%', '')
      .trim(),
  );

  return Number.isFinite(number)
    ? number
    : undefined;
}

/*
|--------------------------------------------------------------------------
| PERFORMANCE
|--------------------------------------------------------------------------
|
| 65     -> Percentage
| 8.36   -> CGPA
|
| IMPORTANT:
| A value <= 10 is treated as CGPA.
| A value > 10 is treated as Percentage.
|
*/

function parsePerformance(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return undefined;
  }

  let raw = normalize(value);

  if (!raw) {
    return undefined;
  }

  const lower = raw.toLowerCase();

  let type;

  if (
    lower.includes('%') ||
    lower.includes('percent')
  ) {
    type = 'Percentage';
  } else if (
    lower.includes('cgpa')
  ) {
    type = 'CGPA';
  }

  raw = raw
    .replace(/%/g, '')
    .replace(/cgpa/gi, '')
    .replace(/percentage/gi, '')
    .trim();

  const number = Number(raw);

  if (!Number.isFinite(number)) {
    return undefined;
  }

  if (!type) {
    type =
      number <= 10
        ? 'CGPA'
        : 'Percentage';
  }

  return {
    value: number,
    type,
  };
}

/*
|--------------------------------------------------------------------------
| GENDER
|--------------------------------------------------------------------------
*/

function normalizeGender(value) {
  const gender = normalize(value).toLowerCase();

  if (
    gender === 'male' ||
    gender === 'm'
  ) {
    return 'Male';
  }

  if (
    gender === 'female' ||
    gender === 'f'
  ) {
    return 'Female';
  }

  if (
    gender === 'other'
  ) {
    return 'Other';
  }

  if (
    gender === 'prefer not to say'
  ) {
    return 'Prefer not to say';
  }

  return undefined;
}

/*
|--------------------------------------------------------------------------
| PROGRAM
|--------------------------------------------------------------------------
*/

function normalizeProgram(value) {
  const program = normalize(value)
    .toLowerCase()
    .replace(/\s+/g, ' ');

  const map = {
    'b.tech.-cse': 'B.Tech.-CSE',
    'btech-cse': 'B.Tech.-CSE',
    'b.tech-cse': 'B.Tech.-CSE',
    'b.tech cse': 'B.Tech.-CSE',
    'btech cse': 'B.Tech.-CSE',

    'b.tech.-ai/ml': 'B.Tech.-AI/ML',
    'b.tech-ai/ml': 'B.Tech.-AI/ML',
    'btech-ai/ml': 'B.Tech.-AI/ML',
    'b.tech ai/ml': 'B.Tech.-AI/ML',
    'btech ai/ml': 'B.Tech.-AI/ML',

    'b.tech.-cse-iot': 'B.Tech.-CSE-IoT',
    'b.tech-cse-iot': 'B.Tech.-CSE-IoT',
    'btech-cse-iot': 'B.Tech.-CSE-IoT',
    'b.tech cse iot': 'B.Tech.-CSE-IoT',
    'btech cse iot': 'B.Tech.-CSE-IoT',

    'b.tech.-cse-ds': 'B.Tech.-CSE-DS',
    'b.tech-cse-ds': 'B.Tech.-CSE-DS',
    'btech-cse-ds': 'B.Tech.-CSE-DS',
    'b.tech cse ds': 'B.Tech.-CSE-DS',
    'btech cse ds': 'B.Tech.-CSE-DS',
  };

  return map[program];
}

/*
|--------------------------------------------------------------------------
| HEADER HELPER
|--------------------------------------------------------------------------
*/

function getValue(row, possibleHeaders) {
  for (const header of possibleHeaders) {
    if (
      Object.prototype.hasOwnProperty.call(
        row,
        header,
      )
    ) {
      const value = row[header];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        return value;
      }
    }
  }

  return '';
}

/*
|--------------------------------------------------------------------------
| BUILD STUDENT DATA
|--------------------------------------------------------------------------
*/

function buildStudentData(row) {
  /*
   * Roll No is the primary Excel identifier.
   *
   * It becomes:
   *
   * studentId
   * rollNumber
   */

  const rollNumber = normalize(
    getValue(row, [
      'Roll No',
      'Roll No.',
      'Roll Number',
      'Roll No ',
      'Student ID',
      'Student Id',
      'StudentID',
      'Enrollment No',
      'Enrollment Number',
    ]),
  );

  const name = normalize(
    getValue(row, [
      'Name',
      'Student Name',
      'Student name',
      'Name of Student',
    ]),
  );

  const email = normalize(
    getValue(row, [
      'Email',
      'Email ID',
      'Email Id',
      'E-mail',
      'E-mail ID',
    ]),
  ).toLowerCase();

  const program = normalizeProgram(
    getValue(row, [
      'Course / Branch',
      'Course/Branch',
      'Course / branch',
      'Course',
      'Branch',
      'Program',
    ]),
  );

  const section = normalize(
    getValue(row, [
      'Year Section',
      'Year / Section',
      'Year/Section',
      'Section',
    ]),
  );

  const year = normalize(
    getValue(row, [
      'Year',
      'Academic Year',
      'Year of Study',
    ]),
  );

  const batch = normalize(
    getValue(row, [
      'Batch',
      'Batch Year',
    ]),
  );

  const semester = numberValue(
    getValue(row, [
      'Semester',
      'Current Semester',
      'Sem',
    ]),
  );

  const yearOfPassing = numberValue(
    getValue(row, [
      'Year of Passing',
      'Passing Year',
      'Year Of Passing',
    ]),
  );

  const data = {
    studentId: rollNumber,
    rollNumber,

    name,

    email,

    phone: normalize(
      getValue(row, [
        'Phone',
        'Mobile',
        'Mobile Number',
        'Phone Number',
      ]),
    ),

    dateOfBirth:
      getValue(row, [
        'Date of Birth',
        'DOB',
        'Date Of Birth',
      ]) || undefined,

    gender: normalizeGender(
      getValue(row, [
        'Gender',
        'Sex',
      ]),
    ),

    program,

    course: normalize(
      getValue(row, [
        'Course',
      ]),
    ),

    branch: normalize(
      getValue(row, [
        'Branch',
      ]),
    ),

    batch,

    year,

    semester,

    section,

    yearOfPassing,

    academicDetails: {
      tenth: numberValue(
        getValue(row, [
          '10th',
          '10th %',
          '10th Percentage',
          '10th Marks',
          'X Percentage',
        ]),
      ),

      twelfth: numberValue(
        getValue(row, [
          '12th',
          '12th %',
          '12th Percentage',
          '12th Marks',
          'XII Percentage',
        ]),
      ),
    },

    academicPerformance: {
      semester1: parsePerformance(
        getValue(row, [
          'Sem 1',
          'Semester 1',
          'Sem1',
          'Semester1',
        ]),
      )?.value,

      semester2: parsePerformance(
        getValue(row, [
          'Sem 2',
          'Semester 2',
          'Sem2',
          'Semester2',
        ]),
      )?.value,

      semester3: parsePerformance(
        getValue(row, [
          'Sem 3',
          'Semester 3',
          'Sem3',
          'Semester3',
        ]),
      )?.value,

      semester4: parsePerformance(
        getValue(row, [
          'Sem 4',
          'Semester 4',
          'Sem4',
          'Semester4',
        ]),
      )?.value,

      semester5: parsePerformance(
        getValue(row, [
          'Sem 5',
          'Semester 5',
          'Sem5',
          'Semester5',
        ]),
      )?.value,

      semester6: parsePerformance(
        getValue(row, [
          'Sem 6',
          'Semester 6',
          'Sem6',
          'Semester6',
        ]),
      )?.value,

      semester7: parsePerformance(
        getValue(row, [
          'Sem 7',
          'Semester 7',
          'Sem7',
          'Semester7',
        ]),
      )?.value,

      semester8: parsePerformance(
        getValue(row, [
          'Sem 8',
          'Semester 8',
          'Sem8',
          'Semester8',
        ]),
      )?.value,

      aggregateCGPA:
        parsePerformance(
          getValue(row, [
            'Aggregate',
            'Aggregate Performance',
            'Aggregate CGPA',
            'CGPA',
            'Overall CGPA',
          ]),
        )?.type === 'CGPA'
          ? parsePerformance(
              getValue(row, [
                'Aggregate',
                'Aggregate Performance',
                'Aggregate CGPA',
                'CGPA',
                'Overall CGPA',
              ]),
            )?.value
          : undefined,

      activeBacklogs:
        numberValue(
          getValue(row, [
            'Active Backlogs',
            'Backlogs',
            'Backlog',
            'Active Backlog',
          ]),
        ) || 0,
    },

    technicalSkills: normalize(
      getValue(row, [
        'Technical Skills',
        'Technical Skill',
        'Skill Expertise',
        'Skills',
      ]),
    )
      ? normalize(
          getValue(row, [
            'Technical Skills',
            'Technical Skill',
            'Skill Expertise',
            'Skills',
          ]),
        )
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],

    softSkills: normalize(
      getValue(row, [
        'Soft Skills',
      ]),
    )
      ? normalize(
          getValue(row, [
            'Soft Skills',
          ]),
        )
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],

    certifications: normalize(
      getValue(row, [
        'Certifications',
        'Certifications Done',
      ]),
    )
      ? normalize(
          getValue(row, [
            'Certifications',
            'Certifications Done',
          ]),
        )
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],

    communicationLevel: normalize(
      getValue(row, [
        'Communication Level',
      ]),
    ),

    placementInterest: normalize(
      getValue(row, [
        'Placement Interest',
      ]),
    ),

    higherStudiesPlan: normalize(
      getValue(row, [
        'Higher Studies Plan',
      ]),
    ),

    linkedin: normalize(
      getValue(row, [
        'LinkedIn',
        'Linkedin',
        'LinkedIn Profile',
      ]),
    ),

    github: normalize(
      getValue(row, [
        'GitHub',
        'Github',
        'GitHub Profile',
      ]),
    ),

    portfolio: normalize(
      getValue(row, [
        'Portfolio',
        'Portfolio Link',
        'Portfolio Links',
      ]),
    ),

    remarks: normalize(
      getValue(row, [
        'Remarks',
      ]),
    ),

    originalData: {
      ...row,
    },

    profileOverrides: {},

    dataSource: 'EXCEL',

    importedFrom: 'Excel',

    importedAt: new Date(),
  };

  /*
   * Remove undefined academic fields.
   */

  Object.keys(data.academicDetails).forEach(
    (key) => {
      if (
        data.academicDetails[key] ===
        undefined
      ) {
        delete data.academicDetails[key];
      }
    },
  );

  Object.keys(
    data.academicPerformance,
  ).forEach((key) => {
    if (
      data.academicPerformance[key] ===
      undefined
    ) {
      delete data.academicPerformance[key];
    }
  });

  /*
   * Remove empty optional values.
   */

  Object.keys(data).forEach((key) => {
    if (
      data[key] === '' ||
      data[key] === undefined
    ) {
      delete data[key];
    }
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| IMPORT STUDENTS
|--------------------------------------------------------------------------
*/

export async function importStudentsFromExcel(
  req,
  res,
  next,
) {
  try {
    /*
     * Only ADMIN and HOD can import.
     */

    if (
      !['ADMIN', 'HOD'].includes(
        req.user.role,
      )
    ) {
      throw new ApiError(
        403,
        'Only ADMIN or HOD can import students',
        'FORBIDDEN',
      );
    }

    /*
     * File check.
     */

    if (!req.file) {
      throw new ApiError(
        400,
        'Please upload an Excel file',
        'FILE_REQUIRED',
      );
    }

    /*
     * Read workbook.
     */

    const workbook = XLSX.read(
      req.file.buffer,
      {
        type: 'buffer',
        cellDates: true,
      },
    );

    const sheetName =
      workbook.SheetNames[0];

    if (!sheetName) {
      throw new ApiError(
        400,
        'Excel file does not contain a worksheet',
        'INVALID_EXCEL',
      );
    }

    const worksheet =
      workbook.Sheets[sheetName];

    const rows =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: '',
          raw: false,
        },
      );

    if (!rows.length) {
      throw new ApiError(
        400,
        'Excel sheet is empty',
        'EMPTY_EXCEL',
      );
    }

    /*
     * Import result.
     */

    const result = {
      totalRows: rows.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    /*
     * Process every Excel row.
     */

    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      const row = rows[index];

      try {
        const data =
          buildStudentData(row);

        /*
         * Student ID is mandatory.
         */

        if (!data.studentId) {
          result.skipped += 1;

          result.errors.push({
            row: index + 2,
            reason:
              'Roll No / Student ID is missing',
          });

          continue;
        }

        /*
         * Name is mandatory.
         */

        if (!data.name) {
          result.skipped += 1;

          result.errors.push({
            row: index + 2,
            studentId:
              data.studentId,
            reason:
              'Student name is missing',
          });

          continue;
        }

        /*
         * Email is mandatory because Student.js
         * requires email.
         */

        if (!data.email) {
          result.skipped += 1;

          result.errors.push({
            row: index + 2,
            studentId:
              data.studentId,
            reason:
              'Email is required',
          });

          continue;
        }

        /*
         * Program validation.
         */

        if (
          data.program &&
          !PROGRAMS.includes(
            data.program,
          )
        ) {
          result.skipped += 1;

          result.errors.push({
            row: index + 2,
            studentId:
              data.studentId,
            reason:
              'Invalid B.Tech program',
          });

          continue;
        }

        /*
         * Find existing student.
         */

        const existing =
          await Student.findOne({
            $or: [
              {
                studentId:
                  data.studentId,
              },
              {
                rollNumber:
                  data.rollNumber,
              },
            ],
            isDeleted: false,
          });

        /*
         * ========================================================
         * EXISTING STUDENT
         * ========================================================
         */

        if (existing) {
          /*
           * IMPORTANT:
           *
           * Excel must NOT overwrite website edits.
           *
           * profileOverrides contains fields edited
           * through the website.
           */

          const overrides =
            existing.profileOverrides ||
            {};

          const updateData = {
            originalData:
              data.originalData,

            importedFrom:
              req.file.originalname,

            importedAt:
              new Date(),

            updatedBy:
              req.user._id,
          };

          /*
           * Only update fields which have NOT been
           * manually overridden.
           */

          const protectedFields =
            new Set(
              Object.keys(overrides),
            );

          const editableFromExcel = [
            'name',
            'email',
            'phone',
            'dateOfBirth',
            'gender',
            'program',
            'course',
            'branch',
            'batch',
            'year',
            'semester',
            'section',
            'yearOfPassing',
            'academicDetails',
            'academicPerformance',
            'technicalSkills',
            'softSkills',
            'certifications',
            'communicationLevel',
            'placementInterest',
            'higherStudiesPlan',
            'linkedin',
            'github',
            'portfolio',
            'remarks',
          ];

          for (
            const field of editableFromExcel
          ) {
            if (
              !protectedFields.has(
                field,
              ) &&
              data[field] !== undefined
            ) {
              updateData[field] =
                data[field];
            }
          }

          /*
           * If there are no overrides,
           * source remains EXCEL.
           *
           * If overrides exist,
           * source remains MIXED.
           */

          updateData.dataSource =
            Object.keys(overrides)
              .length > 0
              ? 'MIXED'
              : 'EXCEL';

          /*
           * Update linked User if name/email
           * came from Excel and are not overridden.
           */

          const userChanges = {};

          if (
            !protectedFields.has(
              'name',
            ) &&
            data.name
          ) {
            userChanges.name =
              data.name;
          }

          if (
            !protectedFields.has(
              'email',
            ) &&
            data.email
          ) {
            userChanges.email =
              data.email.toLowerCase();
          }

          if (
            Object.keys(userChanges)
              .length
          ) {
            await User.findByIdAndUpdate(
              existing.userId,
              {
                $set: userChanges,
              },
              {
                runValidators: true,
              },
            );
          }

          await Student.findByIdAndUpdate(
            existing._id,
            {
              $set: updateData,
            },
            {
              runValidators: true,
            },
          );

          result.updated += 1;

          continue;
        }

        /*
         * ========================================================
         * NEW STUDENT
         * ========================================================
         */

        /*
         * Check whether email already belongs
         * to another user.
         */

        let user =
          await User.findOne({
            email:
              data.email.toLowerCase(),
          });

        if (user) {
          /*
           * If email belongs to an existing MENTEE,
           * we can connect the new Student record.
           */

          if (
            user.role !== 'MENTEE'
          ) {
            result.skipped += 1;

            result.errors.push({
              row: index + 2,
              studentId:
                data.studentId,
              reason:
                'Email already belongs to another user',
            });

            continue;
          }
        } else {
          /*
           * Create MENTEE account.
           *
           * Temporary password is:
           *
           * StudentID@123
           *
           * Example:
           *
           * 23CSE001@123
           *
           * It satisfies the minimum 8-character
           * requirement in User.js.
           */

          const temporaryPassword =
            `${data.studentId}@123`;

          user =
            await User.create({
              name: data.name,
              email:
                data.email.toLowerCase(),
              password:
                temporaryPassword,
              role: 'MENTEE',
            });
        }

        /*
         * Create Student.
         */

        const student =
          await Student.create({
            ...data,

            userId: user._id,

            importedFrom:
              req.file.originalname,

            importedAt:
              new Date(),

            dataSource: 'EXCEL',

            originalData:
              data.originalData,

            profileOverrides: {},

            createdBy:
              req.user._id,

            updatedBy:
              req.user._id,
          });

        result.created += 1;

        /*
         * Audit newly created student.
         */

        await audit(req, {
          action:
            'STUDENT_EXCEL_IMPORT_CREATE',

          module: 'STUDENT',

          recordId:
            student.id,

          newValue:
            student.toObject(),
        });
      } catch (error) {
        result.skipped += 1;

        result.errors.push({
          row: index + 2,
          reason: error.message,
        });
      }
    }

    /*
     * Final import audit.
     */

    await audit(req, {
      action:
        'STUDENT_EXCEL_IMPORT',

      module: 'STUDENT',

      newValue: result,
    });

    /*
     * Response.
     */

    return res.status(200).json({
      success: true,

      message:
        'Student Excel import completed successfully',

      data: result,
    });
  } catch (error) {
    next(error);
  }
}