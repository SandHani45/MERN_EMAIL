const express = require("express");
const validate = require("express-validation");
const AuthController = require("../controllers/auth.controller");
const passport = require('passport');
const router = express.Router();
const {
  login,
  register,
  mobileNumber
} = require("../validations/auth.validation");
// local 
router.route("/register").post(validate(register), AuthController.register);
router.route("/login").post(validate(login), AuthController.login);
router.route("/verify").get(AuthController.verify);
//mobile 
router.route("/send-mobile-otp").post(validate(mobileNumber),AuthController.sendMobileOtp);
// router.route("/verify-mobile-otp").post();
// router.route("/retry-mobile-otp").post();
// social 
router.route('/facebook').post(validate(mobileNumber),passport.authenticate('facebookToken', { session: false }), AuthController.OAuth);
router.route('/google').post(passport.authenticate('googleToken', { session: false }), AuthController.OAuth);
router.route('/twitter').post(passport.authenticate('twitterToken', { session: false }), AuthController.OAuth);
module.exports = router;