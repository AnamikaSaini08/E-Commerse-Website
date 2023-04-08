const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModels');
const ErrorHandler = require('../utils/errorHandler');
const sentToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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

//Forgot Password

exports.forgotPassword = catchAsyncErrors( async (req , res , next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User Not Found!" , 404));
    }

    //Get ResetPasswordToken
    const resetToken = await user.getResetPasswordToken();

    //have to save bcz resetPasswordExpired and resetPasswordToken add but don't save(bcz user already made and this 
    //set now)
    await user.save({validateBeforeSave: false});

    //In link normal token has been send instead by hashed token
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email,
    then please ignore it`;

    try{
        await sendEmail({
            email: user.email,
            subject: `Ecommerse Website Recovery`,
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })

    }catch(err){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpired = undefined;
        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(err.message , 500));
    }
});

//Reset Password
exports.resetPassword = catchAsyncErrors( async(req , res,  next)=>{
    //create hash token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpired: {$gt: Date.now()}
    });

    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or has been expired." , 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpired = undefined;
    await user.save({validateBeforeSave: false});

    //send new token
    sendToken(user, 200 , res);
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