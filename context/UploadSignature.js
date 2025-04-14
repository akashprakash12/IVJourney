const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Define all upload directories
const uploadDirs = {
  signatures: {
    student: path.join(__dirname, '../uploads/student-signatures'),
    parent: path.join(__dirname, '../uploads/parent-signatures')
  },
  studentRequests: path.join(__dirname, '../uploads/student-requests'),
  general: path.join(__dirname, '../uploads/general')
};

// Delete file helper
const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

// Ensure directories exist
Object.values(uploadDirs).forEach(dir => {
  if (typeof dir === 'object') {
    Object.values(dir).forEach(subDir => {
      if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
    });
  } else {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs and Word docs are allowed!'), false);
  }
};

// Multer storages
const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDirs.general;
    if (file.fieldname === 'studentSignature') {
      uploadPath = uploadDirs.signatures.student;
    } else if (file.fieldname === 'parentSignature') {
      uploadPath = uploadDirs.signatures.parent;
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const studentRequestStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirs.studentRequests),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirs.general),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// Final exports
module.exports = {
  uploadSignatures: multer({
    storage: signatureStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  }).fields([
    { name: 'studentSignature', maxCount: 1 },
    { name: 'parentSignature', maxCount: 1 }
  ]),

  uploadStudentRequests: multer({
    storage: studentRequestStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }),

  uploadGeneral: multer({
    storage: generalStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  }),

  uploadDirs,
  deleteFile
};
