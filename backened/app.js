const express = require('express');
const app = express();

const errorMiddleware = require('./middleware/error');

app.use(express.json());

//Import Routes
const products = require('./routes/productRoutes');
app.use('/api/v1',products);

//Middleware for error
app.use(errorMiddleware);

module.exports = app;