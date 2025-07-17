const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [files] = await db.query('SELECT COUNT(*) AS totalFiles FROM csv_files');
    const [records] = await db.query('SELECT COUNT(*) AS totalRecords FROM csv_records');
    const [validNICs] = await db.query('SELECT COUNT(*) AS validNICs FROM validated_nics');
    const [invalidNICs] = await db.query(`
      SELECT COUNT(*) AS invalidNICs
      FROM csv_records
      WHERE nic IS NULL OR id NOT IN (SELECT id FROM validated_nics)
    `);
    const [genderDist] = await db.query('SELECT gender, COUNT(*) AS count FROM validated_nics GROUP BY gender');
    const [ageGroups] = await db.query(`
      SELECT
        CASE
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 50 THEN '36-50'
          WHEN age BETWEEN 51 AND 60 THEN '51-60'
          ELSE '60+'
        END AS age_group,
        COUNT(*) AS count
      FROM validated_nics
      GROUP BY age_group
    `);
    const [recordsPerFile] = await db.query(`
      SELECT cf.id, cf.filename, COUNT(cr.id) AS record_count
      FROM csv_files cf
      LEFT JOIN csv_records cr ON cf.id = cr.csv_file_id
      GROUP BY cf.id
      ORDER BY cf.uploaded_at DESC
      LIMIT 12
    `);

    res.json({
      totalFiles: files[0].totalFiles,
      totalRecords: records[0].totalRecords,
      validNICs: validNICs[0].validNICs,
      invalidNICs: invalidNICs[0].invalidNICs,
      genderDistribution: genderDist,
      ageGroupDistribution: ageGroups,
      recordsPerFile,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

module.exports = { getDashboardStats };
