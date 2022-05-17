// const auth = require('./signupAndLogin/auth')
// const {generateForgotPasswordToken} = auth

const { decode } = require("jsonwebtoken")


// const nodemailer = require('nodemailer');
// const { stringify } = require('nodemon/lib/utils');
// require('dotenv').config();

// function mail() {
//     generateForgotPasswordToken({email: "seunoduez@gmail.com"})
//         .then(token => {
//             const transporter = nodemailer.createTransport({
//                 service : "gmail",
//                 auth: {
//                     user: "backendseun@gmail.com",
//                     pass: process.env.EMAIL_PASSWORD
//                 }  
//             });
        
//             const options = {
//                 from: "backendseun@gmail.com",
//                 to: "seunoduez@gmail.com",
//                 subject: "Sending email with node.js!",
//                 text: "Wow! That's simple! " + token
//             };
        
//             console.log(options)

//             transporter.sendMail(options, function(err, info) {
//                 if(err) {
//                     console.log(err);
//                     return;
//                 }
//                 console.log("Email sent: " + info.response);
//             })
//         })
// }
// mail()
const jwt = require('jsonwebtoken');
const { stringify } = require("nodemon/lib/utils");

const FORGOT_PASSWORD_SECRET = 'indomitabo9032urjpfble-rign#ionf@nrfnro$thisisnowit'


function verifyToken(token) {
    jwt.verify(token, FORGOT_PASSWORD_SECRET, function(err, decoded) {
        if (err) console.log(err)
        console.log(stringify(decoded.email))
    }) 
}

verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNldW5vZHVlekBnbWFpbC5jb20iLCJpYXQiOjE2NTI4MDY5MDl9.pWajkf0bmNzD_zPuJriFbtsKXNNB8hQAOOtyj6ND5NY")