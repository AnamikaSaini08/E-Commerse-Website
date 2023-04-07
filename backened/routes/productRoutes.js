const express = require("express");
const {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
} = require("../controllers/productController");
const router = express.Router();
const { isAutheticatedUser, authorizedRoles } = require("../middleware/auth");

//create Product
router
  .route("/product/new")
  .post(isAutheticatedUser, authorizedRoles("admin"), createProduct);

//get All Product
router.route("/products").get(getAllProduct);

//Update Product
router
  .route("/product/:id")
  .put(isAutheticatedUser, authorizedRoles("admin"), updateProduct);

//Delete Product , Get Product By Id
router
  .route("/product/:id")
  .delete(isAutheticatedUser, authorizedRoles("admin"), deleteProduct)
  .get(getProductDetails);

module.exports = router;
