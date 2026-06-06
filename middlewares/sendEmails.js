const nodemailer = require("nodemailer");
require("process");

const sendEmail = async (data) => {
  const from = "appuniversee@gmail.com";
  const to = "info@fouq.agency";
  const subject = "You have revceived a new order mail";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "appuniversee@gmail.com",
      pass: "jcsxgnxgfyhueqcc",
    },
  });
  const mailOptions = {
    from,
    to,
    subject,
    text: `Hello There,

    You have received a new order mail, here is the sender information:

    Name: ${data.name}.
    Brand: ${data.businessName}.
    Email: ${data.email}.
    Phone: ${data.phone}.
    Budget: ${data.budget}.

    And here is the mail brief: 
    
    ${data.brief}`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return false;
    } else {
      return true;
    }
  });
};

module.exports = { sendEmail };
