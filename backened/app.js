const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const errorMiddleware = require('./middleware/error');

app.use(express.json());
app.use(cookieParser());

//Import Routes
const products = require('./routes/productRoutes');
const user = require('./routes/userRoutes');

app.use('/api/v1',products);
app.use('/api/v1',user);

//Middleware for error
app.use(errorMiddleware);

module.exports = app;