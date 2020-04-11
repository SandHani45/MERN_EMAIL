const path = require("path");

// import .env variables
require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
  sample: path.join(__dirname, "../../.env.example")
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  nodeMailUser: process.env.NODEMAIL_USER,
  nodeMailPass: process.env.NODEMAIL_PASS,
  nodeMailPort: process.env.NODEMAIL_PORT,
  nodeMailHost: process.env.NODEMAIL_HOST,
  nodeMailFrom: process.env.NODEMAIL_FROM,
  nodeMailSubject: process.env.NODEMAIL_SUBJECT,
  facebookClientID: process.env.FACEBOOK_CLINET_ID,
  facebookClientSecret: process.env.FACEBOOK_CLINET_SECRET,
  googleClientId: process.env.GOOGLE_CLINET_ID,
  googleClientSecret: process.env.GOOGLE_CLINET_SECRET,
  newSampleUserTotalRedeemedToDate: process.env.TOOTLE_REDEEMED_TO_DATE,
  newSampleUserTotalAccruedTodate: process.env.TOTLE_ACCRUED_TO_DATA,
  newSocilaUserTotalRedeemedToDate:process.env.SOCIAL_TOOTLE_REDEEMED_TO_DATE,
  mongo: {
    uri:
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TESTS
        : process.env.MONGO_URI
  }
};