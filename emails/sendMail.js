const nodemailer = require("nodemailer");
require("dotenv").config();

// creating reuseable transporter object using the default smtp transport
let transport = nodemailer.createTransport({
  service: "Gmail",
  //   host: "smtp.mailtrap.io",
  //   port: 587,
  //   secure: false, // true for 465 , false for other port
  auth: {
    user: "invisionlearnovative@gmail.com",
    pass: "VanshikaDimpleSiddhi__183016",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// send mail with defined transport object
let sendMail = async (email, subject, html) => {
  try {
    let data = await transport.sendMail({
      from: "invisionlearnovative@gmail.com",
      to: email,
      subject: subject,
      html: html || "<h2>message arrived</h2>",
      attachments: [
        {
          filename: "logonew.png",
          path: __dirname + "/../img/logonew.png",
          cid: "logo",
        },
      ],
    });
    console.log(data, "data");
    return "success";
  } catch (error) {
    console.log(error);
    return "error";
  }
};

module.exports = sendMail;
