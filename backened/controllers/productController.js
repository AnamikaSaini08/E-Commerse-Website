const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apiFeatures');

//Create Product -- Admin
exports.createProduct = catchAsyncErrors(async(req,res)=>{
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    });
});

//Get All Product
exports.getAllProduct = catchAsyncErrors(async (req,res)=>{
    const resultPerPage = 5;
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find() , req.query)
    .search()
    .filter().pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({
        success: true,
        products,
        productCount
    });
});

//Update Product -- Admin
exports.updateProduct =catchAsyncErrors(async(req, res,next)=>{
    let product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product Not Found!" , 500));
    } 
    product = await Product.findByIdAndUpdate(req.params.id , req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })
}); 

//Get Product Details
exports.getProductDetails =catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found!", 500));
    }
    res.status(200).json({
      success: true,
      product,
    })
});

//Delete Product -- Admin
exports.deleteProduct= catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product Not Found!" , 500));
    }
    await product.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
})

