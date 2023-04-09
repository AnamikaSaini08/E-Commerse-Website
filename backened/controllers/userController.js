const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModels');
const ErrorHandler = require('../utils/errorHandler');
const sentToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const Product = require('../models/productModel');

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

//Get User Detail

exports.getUserDetails = catchAsyncErrors( async( req , res, next)=>{
    
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true , 
        user
    });
});

//Update User Password

exports.updateUserPassword = catchAsyncErrors( async( req , res, next)=>{
    
    const user = await User.findById(req.user.id).select("+password");
    
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old Password is Incorrect" , 401));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match" , 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sentToken(user , 200 , res);
});

//Update User Profile

exports.updateUserProfile = catchAsyncErrors( async( req , res, next)=>{

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.body.id , newUserData , {
        new: true ,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    });
});

//Get All Users(By Admin)

exports.getAllUsers = catchAsyncErrors( async( req , res, next)=>{
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
});

//Get Single User(By Admin)

exports.getSingleUser = catchAsyncErrors( async( req , res, next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("User does not exist with Id: "+ req.params.id));
    }
    res.status(200).json({
        success: true,
        user
    })
});

//Update User Role(By Admin)

exports.updateUserRole = catchAsyncErrors( async( req , res, next)=>{

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    //here params used bcz in req.user.id or req.body.id - admin id present bcz he is login
    const user = await User.findByIdAndUpdate(req.params.id , newUserData , {
        new: true ,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    });
});

//Delete User(By Admin)

exports.deleteUser = catchAsyncErrors( async( req , res, next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("User does not exist with Id: "+req.params.id));
    }
    await user.deleteOne(); 

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    });
});

//Create New Review Or Update The Review

exports.createProductReview = catchAsyncErrors(async (req , res , next)=>{
    const {rating , comment , productId} = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);
    
    const isReviewed = product.reviews.find( (rev) => rev.user.toString() === req.user._id.toString());

    if(isReviewed){
        product.reviews.forEach( (rev)=> {
            if(rev.user.toString() === req.user._id.toString()){
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach( (rev)=> {avg += rev.rating});
    product.ratings = avg / product.reviews.length;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })
});

//Get All Reviews Of A Product

exports.getProductRevies = catchAsyncErrors (async(req , res , next)=>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next( new ErrorHandler("Product Not Found ", 404));
    };

    res.status(200).json({
        sucess: true,
        reviews: product.reviews
    });
});

//Delete Review(By some user/admin)

exports.deleteRevies = catchAsyncErrors (async(req , res , next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next( new ErrorHandler("Product Not Found ", 404));
    };

    const reviews =  product.reviews.filter( (rev) => rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    reviews.forEach( (rev)=> {avg += rev.rating});

    const ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId , {
        reviews,
        ratings,
        numOfReviews
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        sucess: true,
    });
});
