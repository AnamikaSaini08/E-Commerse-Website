const ErrorHandler = require("../utils/errorHandler");

module.exports = (err , req,res , next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong MongoDB ID Error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message , 400);
    }

    //Mongoose dulplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} enter`;
        err = new ErrorHandler(message , 400);
    }

    //Wrong json web token
    if(err.name === "jsonWebTokenError"){
        const message = `Json web token is Invalid , try again!`;
        err = new ErrorHandler(message,400);
    }

    //JWT Expire Error
    if(err.name === "TokenExpiredError"){
        const message = `Json web token is Expire , try again!`;
        err = new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
}