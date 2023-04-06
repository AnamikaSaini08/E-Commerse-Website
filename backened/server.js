const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

//Handling Uncouaght Exception
process.on("uncaughtException" , (err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shut down server due to uncaught exception");
    process.exit(1);
})

//env file config
dotenv.config( {path: "backened/config/config.env"});

//connection to db
connectDB();


const server = app.listen(process.env.PORT , ()=>{
    console.log(`server is working at http://localhost:${process.env.PORT}`);
})

//Unhandle Promise
process.on("unhandledRejection" , (err)=>{
    console.log("Unhandle Promise Rejection occurs: " + err.message);
    console.log("Shut down server due to unhandle promise rejection");
    server.close( ()=>{
        process.exit(1);
    });
});