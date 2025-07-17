const express = require('express');
const router = express.Router();
const {
  uploadCSV,
  getCSVFiles,
  getRecordsByCSVFile,
  getValidatedNICs
} = require('../controllers/csvController');

const { getFilteredReport, exportReport } = require('../controllers/reportController');

const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Upload CSV file (auth required)
router.post('/upload', authenticateToken, upload.array('files', 4), uploadCSV); // Uploads multiple CSV files, max 4

// Get all uploaded CSV files
router.get('/files', authenticateToken, getCSVFiles);

// Get records by CSV file ID
router.get('/records/:fileId', authenticateToken, getRecordsByCSVFile);

// Get all validated NICs
router.get('/validated-nics', authenticateToken, getValidatedNICs);

// Get filtered report based on query parameters
router.get('/report', authenticateToken, getFilteredReport);

// Export report
router.get('/report/export', authenticateToken, exportReport);

module.exports = router;
