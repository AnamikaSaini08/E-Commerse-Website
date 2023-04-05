const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

//env file config
dotenv.config( {path: "backened/config/config.env"});

//connection to db
connectDB();


app.listen(process.env.PORT , ()=>{
    console.log(`server is working at http://localhost:${process.env.PORT}`);
})