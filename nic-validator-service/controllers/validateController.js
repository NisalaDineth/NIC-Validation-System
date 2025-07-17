const { extractDetailsFromNIC } = require('../utils/nicUtils');

const validateNIC = async (req, res) => {
  try {
    const { nic } = req.body;

    if (!nic) {
      return res.status(400).json({ message: 'NIC is required' });
    }

    const details = extractDetailsFromNIC(nic);
    if (!details) {
      return res.status(400).json({ message: 'Invalid NIC' });
    }

    return res.status(200).json({ nic, ...details });
  } catch (error) {
    console.error('Error validating NIC:', error);
    res.status(500).json({ message: 'Failed to validate NIC' });
  }
};

module.exports = { validateNIC };