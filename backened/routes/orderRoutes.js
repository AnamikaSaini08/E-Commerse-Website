const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderCOntroller");
const router = express.Router();
const { isAutheticatedUser, authorizedRoles } = require("../middleware/auth");

router.route("/order/new").post(isAutheticatedUser, newOrder);

router.route("/order/:id").get(isAutheticatedUser, getSingleOrder);

router.route("/order/me").get(isAutheticatedUser, myOrders);

router
  .route("/admin/orders")
  .get(isAutheticatedUser, authorizedRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAutheticatedUser, authorizedRoles("admin"), updateOrder)
  .delete(isAutheticatedUser, authorizedRoles("admin"), deleteOrder);

module.exports = router;
