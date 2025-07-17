const express = require('express');
const router = express.Router();
const { validateNIC } = require('../controllers/validateController');

router.post('/', validateNIC); // Accepts a single NIC or array of NICs for validation

module.exports = router;