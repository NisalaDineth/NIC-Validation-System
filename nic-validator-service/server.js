require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const validateRoutes = require('./routes/validateRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/validate', validateRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`NIC Validator Service running on port ${PORT}`);
    });