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
const {
  getProductRevies,
  deleteRevies,
} = require("../controllers/userController");

//create Product
router
  .route("/admin/product/new")
  .post(isAutheticatedUser, authorizedRoles("admin"), createProduct);

//get All Product
router.route("/products").get(getAllProduct);

//Get Product By Id
router.route("/product/:id").get(getProductDetails);

//Delete Product , Update Product
router
  .route("/admin/product/:id")
  .delete(isAutheticatedUser, authorizedRoles("admin"), deleteProduct)
  .put(updateProduct);

router
  .route("/reviews")
  .get(getProductRevies)
  .delete(isAutheticatedUser, deleteRevies);

module.exports = router;
