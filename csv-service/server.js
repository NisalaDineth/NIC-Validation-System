require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const csvRoutes = require('./routes/csvRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use(cors());

app.use(express.json());

app.use('/api/csv', csvRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`CSV service Server running on port ${PORT}`);
});