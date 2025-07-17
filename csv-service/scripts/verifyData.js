const db = require('../config/db');

async function verifyDataIntegrity() {
    try {
        console.log('Verifying data integrity...\n');
        
        // Check csv_files table
        const [files] = await db.query('SELECT COUNT(*) as count FROM csv_files');
        console.log(`Total CSV files: ${files[0].count}`);
        
        // Check csv_records table
        const [records] = await db.query('SELECT COUNT(*) as count FROM csv_records');
        console.log(`Total CSV records: ${records[0].count}`);
        
        // Check validated_nics table
        const [validatedTotal] = await db.query('SELECT COUNT(*) as count FROM validated_nics');
        console.log(`Total validated NICs: ${validatedTotal[0].count}`);
        
        // Check for unique NICs
        const [uniqueNICs] = await db.query('SELECT COUNT(DISTINCT nic) as count FROM validated_nics WHERE nic IS NOT NULL');
        console.log(`Unique NICs: ${uniqueNICs[0].count}`);
        
        // Check for null NICs
        const [nullNICs] = await db.query('SELECT COUNT(*) as count FROM validated_nics WHERE nic IS NULL');
        console.log(`Records with NULL NICs: ${nullNICs[0].count}`);
        
        // Check records per file
        console.log('\nRecords per file:');
        const [recordsPerFile] = await db.query(`
            SELECT f.filename, COUNT(r.id) as record_count
            FROM csv_files f
            LEFT JOIN csv_records r ON r.csv_file_id = f.id
            GROUP BY f.id, f.filename
            ORDER BY f.uploaded_at DESC
        `);
        
        recordsPerFile.forEach(file => {
            console.log(`  ${file.filename}: ${file.record_count} records`);
        });
        
        // Check for orphaned records in validated_nics
        const [orphanedNICs] = await db.query(`
            SELECT COUNT(*) as count 
            FROM validated_nics v 
            LEFT JOIN csv_records r ON v.id = r.id 
            WHERE r.id IS NULL
        `);
        console.log(`\nOrphaned validated NICs (no corresponding csv_record): ${orphanedNICs[0].count}`);
        
        // Check for duplicates
        const [duplicates] = await db.query(`
            SELECT nic, COUNT(*) as count
            FROM validated_nics 
            WHERE nic IS NOT NULL
            GROUP BY nic 
            HAVING COUNT(*) > 1
        `);
        
        if (duplicates.length > 0) {
            console.log(`\nDuplicate NICs found: ${duplicates.length}`);
            duplicates.slice(0, 5).forEach(dup => {
                console.log(`  NIC ${dup.nic}: ${dup.count} times`);
            });
            if (duplicates.length > 5) {
                console.log(`  ... and ${duplicates.length - 5} more`);
            }
        } else {
            console.log('\nNo duplicate NICs found ✓');
        }
        
        // Check file-specific NIC distribution
        console.log('\nNIC distribution per file:');
        const [nicPerFile] = await db.query(`
            SELECT f.filename, COUNT(DISTINCT v.nic) as unique_nics
            FROM csv_files f
            LEFT JOIN csv_records r ON r.csv_file_id = f.id
            LEFT JOIN validated_nics v ON v.id = r.id
            WHERE v.nic IS NOT NULL
            GROUP BY f.id, f.filename
            ORDER BY f.uploaded_at DESC
        `);
        
        nicPerFile.forEach(file => {
            console.log(`  ${file.filename}: ${file.unique_nics} unique NICs`);
        });
        
    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        process.exit(0);
    }
}

verifyDataIntegrity();
