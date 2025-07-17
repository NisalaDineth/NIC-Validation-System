function extractDetailsFromNIC(nic) {
  nic = nic.toUpperCase();
  let year, dayText;

  // Detect NIC format
  if (/^\d{9}[VvXx]$/.test(nic)) {
    year = parseInt('19' + nic.substring(0, 2));
    dayText = parseInt(nic.substring(2, 5));
  } else if (/^\d{12}$/.test(nic)) {
    year = parseInt(nic.substring(0, 4));
    dayText = parseInt(nic.substring(4, 7));
  } else {
    return null;
  }

  // Gender logic
  const gender = dayText > 500 ? 'female' : 'male';
  const dayOfYear = gender === 'female' ? dayText - 500 : dayText;

  // Month days - Sri Lanka NIC system uses 29 days for February regardless of leap year
  const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Add +1 to dayOfYear to correct for timezone-related shift in displayed DOB
  const actualDayOfYear = dayOfYear + 1;
  
  let month = 0;
  let day = actualDayOfYear;

  for (let i = 0; i < monthDays.length; i++) {
    if (day <= monthDays[i]) {
      month = i;
      break;
    }
    day -= monthDays[i];
  }

  // Construct date of birth using UTC to avoid timezone issues
  const dob = new Date(Date.UTC(year, month, day));
  const formattedDob = dob.toISOString().split('T')[0];

  // Age calculation
  const today = new Date();
  let age = today.getFullYear() - year;
  const birthdayThisYear = new Date(today.getFullYear(), month, day);
  if (today < birthdayThisYear) age--;

  return { dob: formattedDob, gender, age };
}

module.exports = { extractDetailsFromNIC };
