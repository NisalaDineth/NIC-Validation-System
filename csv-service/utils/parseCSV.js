const fs = require('fs');
const csv = require('csv-parser');

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        let lineNumber = 0;
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return reject(new Error(`File not found: ${filePath}`));
        }
        
        fs.createReadStream(filePath, { encoding: 'utf8' })
            .pipe(csv({
                skipEmptyLines: true,
                skipLinesWithError: false,
                strict: false
            }))
            .on('data', (data) => {
                lineNumber++;
                
                // Filter out rows where all values are empty or invalid
                const hasValidData = Object.values(data).some(value => {
                    if (!value) return false;
                    const stringValue = value.toString().trim();
                    return stringValue !== '' && 
                           stringValue !== 'undefined' && 
                           stringValue !== 'null' &&
                           stringValue.length > 0;
                });
                
                if (hasValidData) {
                    // Clean up the data object
                    const cleanedData = {};
                    Object.keys(data).forEach(key => {
                        if (key && key.trim()) {
                            const cleanKey = key.trim();
                            const value = data[key];
                            cleanedData[cleanKey] = value;
                        }
                    });
                    
                    results.push(cleanedData);
                }
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (err) => {
                console.error(`CSV parsing error:`, err);
                reject(err);
            });
    });
};

module.exports = parseCSV;
