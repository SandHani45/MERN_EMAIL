const nodemailer = require('nodemailer');
const { mailGunUser, mailGunPass } = require('./vars');
const transport = nodemailer.createTransport({
  host: 'smtpout.asia.secureserver.net',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
      user:  'ttpsupport@ttakeoff.com', // generated ethereal user
      pass: 'Pran_Venky@1213' // generated ethereal password
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = {
  sendEmail(from, to, subject, html) {
    return new Promise((resolve, reject) => {
      transport.sendMail({ from, subject, to, html }, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });
  }
}