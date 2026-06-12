// Memuat variabel environment
require('dotenv').config();
const express = require('express');
const path = require('path');
const apiRoutes = require('./api/routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware parsing URL
app.use(express.urlencoded({ extended: true }));

// Routing
app.use('/', apiRoutes);

// Middleware penanganan error
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});