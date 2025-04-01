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

// Create directories if they don't exist
Object.values(uploadDirs).forEach(dir => {
  if (typeof dir === 'object') {
    Object.values(dir).forEach(subDir => {
      if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
    });
  } else {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for signatures
const signatureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadDirs.general; // default
    
    if (file.fieldname === 'studentSignature') {
      uploadPath = uploadDirs.signatures.student;
    } else if (file.fieldname === 'parentSignature') {
      uploadPath = uploadDirs.signatures.parent;
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// Configure storage for student requests
const studentRequestStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirs.studentRequests);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const generalStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirs.general);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// File filter to only accept certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png',
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs and Word docs are allowed!'), false);
  }
};

// Configure different multer upload instances
exports.uploadSignatures = multer({
  storage: signatureStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
}).fields([
  { name: 'studentSignature', maxCount: 1 },
  { name: 'parentSignature', maxCount: 1 }
]);

exports.uploadStudentRequests = multer({
  storage: studentRequestStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for student requests
  }
});
exports.uploadGeneral = multer({
  storage: generalStorage,  // Use the storage configuration instead of dest
  fileFilter: fileFilter,   // Add the same file filter
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});