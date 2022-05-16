const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service : "hotmail",
    auth: {
        user: "180806080@live.unilag.edu.ng",
        pass: process.env.EMAIL_PASSWORD
    }  
});

const options = {
    from: "180806080@live.unilag.edu.ng",
    to: "seunoduez@gmail.com",
    subject: "Sending email with node.js!",
    text: "Wow! That's simple!"
};

transporter.sendMail(options, function(err, info) {
    if(err) {
        console.log(err);
        return;
    }
    console.log("Sent: " + info.response);
})