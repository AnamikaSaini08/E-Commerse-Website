const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//Create New Order
//Imp- During placing an order , also store user_id

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

//Get Single Order

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  //populate - user table(referance) and then from user table name and email field give
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not dound with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//Get Login User Order
//Imp - By retreiving user id as it is store during createOrder(place order) from order db , retrive all its orders

exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    order,
  });
});

//Get All Orders - Admin

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach( (order) => totalAmount += order.totalPrice);
  
    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  });

//UpdateStock()

async function updateStock(id , quantity){
    const product = await Product.findById(id);

    product.stock = product.stock - quantity;
    await product.save({validationBeforeSave: false});
}

//Update Order Status - Admin

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next( new ErrorHandler("Order not found with this Id: "+ req.params.id , 404));
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("You have already delivered this order" , 400));
    }

    order.orderItems.forEach( async (order)=>{
        await updateStock(order.product , order.quantity);
    })

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave: false});
  
    res.status(200).json({
      success: true,
    });
  });

//Delete Order - Admin

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next( new ErrorHandler("Order not found with this Id: "+ req.params.id , 404));
    }

    await order.deleteOne();
  
    res.status(200).json({
      success: true,
    });
  });
