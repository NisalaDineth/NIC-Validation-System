const path = require('path');
const db = require('../config/db');
const parseCSV = require('../utils/parseCSV');
const extractNIC = require('../utils/extractNIC');
const axios = require('axios');

// Upload CSVs (exactly 4)
const uploadCSV = async (req, res) => {
  try {
    const files = req.files;

    // Validate exactly 4 CSV files
    if (!files || files.length < 4) {
      return res.status(400).json({
        message: `You uploaded ${files ? files.length : 0} file(s). Please upload exactly 4 CSV files.`
      });
    }

    if (files.length > 4) {
      return res.status(400).json({
        message: `You uploaded ${files.length} file(s). Maximum allowed is 4 CSV files. Please upload exactly 4 files.`
      });
    }


    for (const file of files) {
      // Use the actual file path from multer
      const filePath = file.path;
      const filename = file.originalname;
      
      console.log(`Processing file: ${filename}`);
      
      // Verify file exists before processing
      if (!require('fs').existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return res.status(500).json({ message: `File not found: ${filename}` });
      }
      
      try {
        const records = await parseCSV(filePath);
        console.log(`Parsed ${records.length} records from ${filename}`);

        // Record the uploaded file
        const [fileResult] = await db.query(
          'INSERT INTO csv_files (filename) VALUES (?)',
          [filename]
        );
        const csvFileId = fileResult.insertId; 

        // Process each record in the CSV
        let processedCount = 0;
        let errorCount = 0;
        
        for (let row of records) {
          try {
            const rowData = JSON.stringify(row);
            const nic = extractNIC(row);

            // Skip rows with no valid data or corrupted rows
            if (!row || Object.keys(row).length === 0 || Object.values(row).every(val => !val || val.toString().trim() === '')) {
              continue;
            }

            // Insert each record linking to the uploaded file
            const [recordResult] = await db.query(
              'INSERT INTO csv_records (nic, raw_data, csv_file_id) VALUES (?, ?, ?)',
              [nic || null, rowData, csvFileId]
            );
            const recordId = recordResult.insertId;

            // Insert valid NIC details via microservice
            if (nic) {
              try {
                const response = await axios.post('http://localhost:5002/api/validate', { nic });
                const { dob, gender, age } = response.data;

                await db.query(
                  'INSERT INTO validated_nics (id, nic, dob, gender, age) VALUES (?, ?, ?, ?, ?)',
                  [recordId, nic, dob, gender, age]
                );
              } catch (error) {
                console.error(`Validation failed for NIC ${nic}:`, error.message);
                errorCount++;
              }
            }
            processedCount++;
          } catch (recordError) {
            console.error(`Error processing record:`, recordError.message);
            errorCount++;
          }
        }
        
        console.log(`File ${filename} processed: ${processedCount} records, ${errorCount} errors`);
        
      } catch (fileError) {
        console.error(`Error processing file ${filename}:`, fileError.message);
        throw new Error(`Failed to process file ${filename}: ${fileError.message}`);
      }
    }

    res.status(200).json({ message: '4 CSV files uploaded and NICs processed successfully.' });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({ message: 'Failed to process CSV files.' });
  }
};

// Get all uploaded CSV files
const getCSVFiles = async (req, res) => {
  try {
    const [files] = await db.query(
      `SELECT f.id, f.filename, f.uploaded_at, COUNT(r.id) AS record_count
       FROM csv_files f
       LEFT JOIN csv_records r ON r.csv_file_id = f.id
       GROUP BY f.id
       ORDER BY f.uploaded_at DESC`
    );
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching CSV files:', error);
    res.status(500).json({ message: 'Failed to fetch CSV files' });
  }
};

// Get records for a specific CSV file
const getRecordsByCSVFile = async (req, res) => {
  const { fileId } = req.params;
  try {
    const [records] = await db.query(
      'SELECT id, nic, raw_data FROM csv_records WHERE csv_file_id = ?',
      [fileId]
    );
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Failed to fetch records' });
  }
};

// Get all validated NICs
const getValidatedNICs = async (req, res) => {
  try {
    const [nics] = await db.query(
      `SELECT vn.id, vn.nic, vn.dob, vn.gender, vn.age, f.filename
       FROM validated_nics vn
       JOIN csv_records r ON vn.id = r.id
       JOIN csv_files f ON r.csv_file_id = f.id
       ORDER BY vn.id DESC`
    );
    res.status(200).json(nics);
  } catch (error) {
    console.error('Error fetching validated NICs:', error);
    res.status(500).json({ message: 'Failed to fetch validated NICs' });
  }
};

module.exports = {
  uploadCSV,
  getCSVFiles,
  getRecordsByCSVFile,
  getValidatedNICs
};