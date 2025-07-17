const db = require('../config/db');
const dayjs = require('dayjs');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Helper function for filtered data
const getFilteredReportData = async (queryParams) => {
  const { gender, age_min, age_max, from_date, to_date, file_id, range } = queryParams;

  let query = `
    SELECT vn.id, vn.nic, vn.dob, vn.gender, vn.age, cf.filename
    FROM validated_nics vn
    JOIN csv_records cr ON vn.id = cr.id
    JOIN csv_files cf ON cr.csv_file_id = cf.id
    WHERE 1=1
  `;
  const params = [];
  const today = dayjs();
  let rangeStart, rangeEnd;

  switch (range) {
    case 'today':
      rangeStart = today.startOf('day').format('YYYY-MM-DD');
      rangeEnd = today.endOf('day').format('YYYY-MM-DD');
      break;
    case 'this_week':
      rangeStart = today.startOf('week').format('YYYY-MM-DD');
      rangeEnd = today.endOf('week').format('YYYY-MM-DD');
      break;
    case 'last_week':
      rangeStart = today.subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
      rangeEnd = today.subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
      break;
    case 'this_month':
      rangeStart = today.startOf('month').format('YYYY-MM-DD');
      rangeEnd = today.endOf('month').format('YYYY-MM-DD');
      break;
    case 'last_month':
      rangeStart = today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
      rangeEnd = today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
      break;
  }

  if (rangeStart && rangeEnd) {
    query += ` AND vn.dob BETWEEN ? AND ?`;
    params.push(rangeStart, rangeEnd);
  }

  if (gender) {
    query += ` AND vn.gender = ?`;
    params.push(gender.toLowerCase());
  }
  if (age_min) {
    query += ` AND vn.age >= ?`;
    params.push(parseInt(age_min));
  }
  if (age_max) {
    query += ` AND vn.age <= ?`;
    params.push(parseInt(age_max));
  }
  if (from_date) {
    query += ` AND vn.dob >= ?`;
    params.push(from_date);
  }
  if (to_date) {
    query += ` AND vn.dob <= ?`;
    params.push(to_date);
  }
  if (file_id) {
    // Handle multiple file IDs (array, comma-separated string) or single file ID
    let fileIds;
    
    if (Array.isArray(file_id)) {
      // Already an array
      fileIds = file_id;
    } else if (typeof file_id === 'string' && file_id.includes(',')) {
      // Comma-separated string like "1,2,3"
      fileIds = file_id.split(',').map(id => id.trim());
    } else {
      // Single file ID
      fileIds = [file_id];
    }
    
    if (fileIds.length > 1) {
      // Multiple files
      const placeholders = fileIds.map(() => '?').join(',');
      query += ` AND cf.id IN (${placeholders})`;
      params.push(...fileIds);
    } else {
      // Single file
      query += ` AND cf.id = ?`;
      params.push(fileIds[0]);
    }
  }

  query += ` ORDER BY vn.id DESC`;
  const [results] = await db.query(query, params);
  return results;
};

// GET JSON Report
const getFilteredReport = async (req, res) => {
  try {
    const results = await getFilteredReportData(req.query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

// EXPORT Report
const exportReport = async (req, res) => {
  try {
    const { format } = req.query;
    const data = await getFilteredReportData(req.query);

    if (!data.length) {
      return res.status(404).json({ message: 'No data available for export' });
    }

    const formattedData = data.map(row => ({
      ...row,
      dob: dayjs(row.dob).format('YYYY-MM-DD'),
    }));

    if (format === 'csv') {
      const fields = ['id', 'nic', 'dob', 'gender', 'age', 'filename'];
      const parser = new Parser({ fields });
      const csv = parser.parse(formattedData);

      res.header('Content-Type', 'text/csv');
      res.attachment('report.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Report');

      sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'NIC', key: 'nic', width: 20 },
        { header: 'DOB', key: 'dob', width: 15 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Filename', key: 'filename', width: 30 },
      ];

      sheet.addRows(formattedData);

      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('report.xlsx');
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Disposition', 'attachment; filename=nics_report.pdf');
      res.setHeader('Content-Type', 'application/pdf');

      doc.pipe(res);

      // Title
      doc.fontSize(16).text('Filtered NIC Report', { align: 'center' });
      doc.moveDown();

      // Table headers
      const headers = ['ID', 'NIC', 'DOB', 'Gender', 'Age', 'File'];
      const columnWidths = [40, 100, 80, 60, 40, 180];
      let y = doc.y;

      doc.fontSize(12).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, 40 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: columnWidths[i] });
      });

      doc.moveDown(0.5);

      // Rows
      doc.font('Helvetica').fontSize(11);
      formattedData.forEach(row => {
        y = doc.y;
        const rowData = [row.id, row.nic, row.dob, row.gender, row.age, row.filename];
        rowData.forEach((value, i) => {
          doc.text(String(value || '-'), 40 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
            width: columnWidths[i],
            ellipsis: true,
          });
        });
        doc.moveDown(0.5);
      });

      doc.end();
      return;
    }

    res.status(400).json({ message: 'Invalid format specified. Use csv, excel or pdf.' });

  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Failed to export report' });
  }
};

module.exports = { getFilteredReport, exportReport };