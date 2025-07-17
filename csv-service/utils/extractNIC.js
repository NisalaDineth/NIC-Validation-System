function extractNIC(row) {
    const nicPattern = /nic/i; // Match "nic" anywhere in column name
    let foundNIC = null;
    let bestMatch = null;
    
    for (let key in row) {
        if (!key || typeof key !== 'string') continue;
        
        const normalizedKey = key.trim().toLowerCase();
        if (nicPattern.test(normalizedKey)) {
            let value = row[key];
            
            // Skip if value is null, undefined, or empty
            if (!value) continue;
            
            value = value.toString().trim();
            
            // Skip obviously invalid values
            if (value === '' || value === 'undefined' || value === 'null') continue;
            
            // Handle scientific notation (e.g., 2.00125E+11 -> 200125403374)
            if (/^\d+\.?\d*[eE][+-]?\d+[VvXx]?$/i.test(value)) {
                // Extract the scientific part and the suffix (V/X) if present
                const match = value.match(/^(\d+\.?\d*[eE][+-]?\d+)([VvXx]?)$/i);
                if (match) {
                    const scientificPart = match[1];
                    const suffix = match[2];
                    
                    const number = parseFloat(scientificPart);
                    if (!isNaN(number)) {
                        value = Math.floor(number).toString() + suffix.toUpperCase();
                    }
                }
            }
            
            value = value.toUpperCase();
            
            // Validate NIC format (old: 9 digits + V/X, new: 12 digits)
            if (/^\d{9}[VvXx]$/i.test(value) || /^\d{12}$/.test(value)) {
                // Prioritize exact "nic" match over partial matches
                if (normalizedKey === 'nic' || normalizedKey === 'nic_number' || normalizedKey === 'nic_holder') {
                    return value; // Return immediately for exact match
                }
                // Store the first valid NIC found as backup
                if (!foundNIC) {
                    foundNIC = value;
                    bestMatch = normalizedKey;
                }
            }
        }
    }
    return foundNIC; // Return the best match found
}

module.exports = extractNIC;
