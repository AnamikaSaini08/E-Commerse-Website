const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateUserPassword,
  updateUserProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
  createProductReview,
} = require("../controllers/userController");
const { isAutheticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

//Register User
router.route("/register").post(registerUser);

//Login User
router.route("/login").post(loginUser);

//Forgot Password
router.route("/password/forgot").post(forgotPassword);

//Reset Password
router.route("/password/reset/:token").put(resetPassword);

//Logout User
router.route("/logout").get(logout);

router.route("/me").get(isAutheticatedUser, getUserDetails);

router.route("/password/update").put(isAutheticatedUser, updateUserPassword);

router.route("/me/update").put(isAutheticatedUser, updateUserProfile);

router
  .route("/admin/users")
  .get(isAutheticatedUser, authorizedRoles("admin"), getAllUsers);

router
  .route("/admin/users/:id")
  .get(isAutheticatedUser, authorizedRoles("admin"), getSingleUser)
  .put(isAutheticatedUser, authorizedRoles("admin"), updateUserRole)
  .delete(isAutheticatedUser , authorizedRoles('admin') , deleteUser);

router.route('/review').put(isAutheticatedUser , createProductReview);

module.exports = router;
