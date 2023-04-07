const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModels');
const ErrorHandler = require('../utils/errorHandler');
const sentToken = require('../utils/jwtToken');

//Register A User
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{

    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id: "This is sample id",
            url: "Profileurl"
        }
    });
    sentToken(user , 201 , res);
});

//Login Users
exports.loginUser = catchAsyncErrors( async(req , res , next)=>{

    const {email , password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please Provide Email And Password" , 500));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password" , 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password" , 401));
    }

    sentToken(user , 200 , res);

});

//Logout

exports.logout = catchAsyncErrors( async(req , res,  next)=>{

    res.cookie("token" , null , {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logout Successfully",
    });
});