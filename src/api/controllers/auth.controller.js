// models
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const { omit } = require("lodash");
// vars
const { 
  jwtExpirationInterval,
  nodeMailSubject,
  nodeMailFrom,
  newSampleUserTotalRedeemedToDate,
  newSampleUserTotalAccruedTodate
 } = require("./../../config/vars");
// email
const fs = require("fs");
const mailer = require("./../../config/mailer")
var promisedHandlebars = require("promised-handlebars");
// mobile otp 
const SendOtp = require('sendotp');
const sendOtp = new SendOtp("304981AnuWqdRjRviZ5dd6512a");
// 3rd party
const httpStatus = require("http-status");
const moment = require("moment-timezone");
var Q = require("q");
var Handlebars = promisedHandlebars(require("handlebars"), {
  Promise: Q.Promise
});
Handlebars.registerHelper("helper", function(value) {
  return Q.delay(100).then(function() {
    return value;
  });
});

// read template file
var readHTMLFile = function(path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function(err, html) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};
/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = "Bearer";
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, "minutes");
  const dateNow = new Date();
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
    dateNow
  };
}
/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try { 
    const userData = omit(req.body, "role");
    const user = await new User(userData).save();
    // email verification 
    host = req.get("host");
    link = "http://" + req.get("host") + "/dev/auth/verify?id=" + user._id;
    username = user.email.replace(/^(.+)@(.+)$/g, "$1");
    readHTMLFile('./public/assets/templates/confirm.html', (err,html)=>{
      if(err) throw err;
      var template = Handlebars.compile(html)
      template({
        user: username,
        link: link
      }).then(template=>{
        mailer.sendEmail(nodeMailFrom, req.body.email, nodeMailSubject, template);
      })
    })
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    res.cookie('access_token', token, {
      httpOnly: true
    });
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};
/**
 * Returns clear the cookie 
 * @public 
 */
exports.loginOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken
    });
    const { user, accessToken } = await User.findAndGenerateToken({
      email,
      refreshObject
    });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns verify email link 
 * @public
 */
exports.verify = async (req, res, next) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { isVerify: true,LoyaltyPoints:{
        totalAccruedTodate: newSampleUserTotalAccruedTodate,
        totalRedeemedToDate: newSampleUserTotalRedeemedToDate,
        netAvailable: ""
      } } },
      { new: true }
    ).then(updatedDoc => {
      if (updatedDoc) {
        return res.json({ 
          status:200,
          isVerify:updatedDoc.isVerify 
        });
      } else {
        return res.json({
          success: false
        });
      }
    });
  } catch (error) {
    return next(error);
  }
};
/**
 * Returns Social auth and jwt token if registration was successful 
 * @public
 */
exports.OAuth  = async (req, res, next) => {
  // Generate token
  const { user, accessToken } = await User.findSocialNetworkAndGenerateToken(req.user);
  const token = generateTokenResponse(user, accessToken);
  res.cookie('access_token', token, {
    httpOnly: true
  });
  res.status(200).json({ token,user });
}
/**
 * Returns mobile otp 
 * @public
 */
exports.sendMobileOtp = async (req,res,next) => {
  try {
    let user = new User(req.body)
    user.save().then(newUser=> {
      let mobile = newUser.mobile
      sendOtp.send(mobile, "PRIIND", "4635", function (error, data) {
        console.log(mobile);
      });
    })
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
}
/**
 * Returns mobile verify and jwt token if registration was successful 
 * @public
 */
exports.verifyOtp = async (req,res,next) => {
  try {
    sendOtp.verify("919999999999", "4365", function (error, data) {
      console.log(data); // data object with keys 'message' and 'type'
      if(data.type == 'success') console.log('OTP verified successfully')
      if(data.type == 'error') console.log('OTP verification failed')
    });
  }catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
}