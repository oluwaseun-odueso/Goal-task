const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
        user: "backendseun@gmail.com",
        pass: process.env.EMAIL_PASSWORD
    }  
});

const options = {
    from: "backendseun@gmail.com",
    to: "seunoduez@gmail.com",
    subject: "Sending email with node.js!",
    text: "Wow! That's simple!"
};

transporter.sendMail(options, function(err, info) {
    if(err) {
        console.log(err);
        return;
    }
    console.log("Emial sent: " + info.response);
})