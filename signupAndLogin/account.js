const express = require('express');
const auth = require('./auth')
const nodemailer = require('nodemailer');
const functions = require('../routes/routesFunctions')
require('dotenv').config()

const router = express.Router();

const {generateToken, generateForgotPasswordToken, verifyToken, verifyForgotPasswordToken} = auth

const {checkIfEnteredPasswordsMatches, 
    checkIfEmailExists, 
    checkIfUserExists, 
    changePassword,
    resetPassword,
    updateAccountProperties,
    addUserToAccount, 
    hashEnteredPassword, 
    getBasicUserDetailsById,
    getBasicUserDetailsByUsername,
    checkIfEnteredPasswordEqualsHashed,
    collectUsernameHashedPassword} = functions

 
router.post('/log_in', async(req, res) => {
    if (req.body.username && req.body.password) {
        try {
            const results = await checkIfUserExists(req.body.username)
    
            if (results === true) {
                const hashedPW = await collectUsernameHashedPassword(req.body.username)
                const checkPassword = await checkIfEnteredPasswordEqualsHashed(req.body.password, hashedPW[0].password)
                if (checkPassword === true) {
                    const userDetails = await getBasicUserDetailsByUsername(req.body.username)
                    const user = JSON.parse(JSON.stringify(userDetails[0]))

                    const token = await generateToken(user)

                    res.status(200).send({
                        message : "You have successfully logged in.", 
                        user, 
                        token
                    })
                } 
                else {
                    res.status(400).send({
                        errno:"116" ,
                        message : "Incorrect Password."
                    })
                }
            }
            else {
                res.status(400).send({
                    errno:"114" ,
                    message : "Username does not exist."
                })
            }
        }
        catch(error) {
            res.send({errno: 162,
                message : error.message})
        }
    }
    else {
        res.status(500).send({
            errno:"112" ,
            message : "All inputs must be entered correctly"
        })
    }    
})


router.post('/signUp', async(req, res) => {
    if(req.body.username && req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.confirm_password) {
        try {
            const checkUser = await checkIfUserExists(req.body.username)
            if (checkUser === false) {
                const checkEmail = await checkIfEmailExists(req.body.email);
                if (checkEmail === false) {
                    const checkPW = await checkIfEnteredPasswordsMatches(req.body.password, req.body.confirm_password);
                    if (checkPW == true) {
                        const hashedPassword = await hashEnteredPassword(req.body.password)
                        await addUserToAccount(req.body.username, req.body.first_name, req.body.last_name, req.body.email, hashedPassword);
                        res.status(201).send({
                            message : "New user added"
                        })
                    }
                    else {
                        res.status(400).send({
                            errno:"115" ,
                            message : "Passwords don't match"
                        })
                    }
                    
                }
                else {
                    res.status(400).send({
                        errno:"113" ,
                        message : "Can't add an existing email."
                    })
                }    
            }
            else {
                res.status(400).send({
                    errno:"111" ,
                    message : "Can't add an existing username."
                })
            }   
        }
        catch(error) {
            res.send({message : error.message})
        }
    }
    else res.status(500).send({
        errno : "101", 
        message : "All fields must be entered correctly"})
})


router.patch('/update_account_details', verifyToken, async(req, res) => {
    if (req.body.first_name && req.body.last_name && req.body.email) {
        try {
            await updateAccountProperties(req.body.first_name, req.body.last_name, req.body.email, req.user.id)
            const details = await getBasicUserDetailsById(req.user.id)
            res.status(201).send({
                message : "Updated",
                details
            })
        }
        catch(error) {
            res.send({errno : 124, message : error.message})
        }
    }
    else {
        res.status(500).send({
            error:"104" ,
            message : "All properties must be entered correctly."
        })
    }
})

router.patch('/change_password', verifyToken, async(req, res) => {
    if (req.body.old_password && req.body.new_password && req.body.confirm_new_password) {
        try {
            const oldHashedPW = await collectUsernameHashedPassword(req.user.username)
            const checkPassword = await checkIfEnteredPasswordEqualsHashed(req.body.old_password, oldHashedPW[0].password)
            if (checkPassword === true) {
                const confirmNewPassword = await checkIfEnteredPasswordsMatches(req.body.new_password, req.body.confirm_new_password)
                if (confirmNewPassword == true) {
                    const hashedPassword = await hashEnteredPassword(req.body.new_password)
                    await changePassword(hashedPassword, req.user.id);
                    res.status(201).send({
                        message : "Password Updated, your new password is " + (req.body.new_password).toString()
                    })
                }
                else {
                    res.status(400).send({
                        errno:"115" ,
                        message : "Passwords don't match"
                    })
                }
            }
            else {
                res.status(400).send({
                    errno:"116" ,
                    message : "Incorrect old password."
                })
            }
        }
        catch (error) {
            res.send({errno : "106", message : error.message})
        }
    }
    else {
        res.status(500).send({
            error:"104" ,
            message : "All properties must be entered correctly."
        })
    }
})

router.patch('/reset_password', async(req, res) => {
    if (req.body.reset_token, req.body.new_password) {
        try {
            const hashedPassword = await hashEnteredPassword(req.body.new_password)
            const email = await verifyForgotPasswordToken(req.body.reset_token)
            await resetPassword(hashedPassword, email);
            res.status(201).send({
                message : "Your password has been reset, please login."
            })
        }
        catch (error) {
            res.send({errno : "106", message : error.message})
        }
    }
    else {
        res.status(500).send({
            error:"104" ,
            message : "Enter reset password token and new password."
        })
    }
})

router.post('/forgot_password', async(req, res) => {
    if (req.body.email) {
        try {
            const checkEmail = await checkIfEmailExists(req.body.email)
            if (checkEmail == true) {
                const token = await generateForgotPasswordToken({email: req.body.email})
        
                const transporter = nodemailer.createTransport({
                    service : "gmail",
                    auth: {
                        user: "backendseun@gmail.com",
                        pass: process.env.EMAIL_PASSWORD
                    }  
                });
        
                const options = {
                    from: "backendseun@gmail.com",
                    to: req.body.email,
                    subject: "Sending email with node.js!",
                    text: "Wow! That's simple! " + token
                };
        
                transporter.sendMail(options, function(err, info) {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    console.log("Email sent: " + info.response);
                })
                res.status(200).send({
                    message : "Password reset link has been sent to email address.",
                })
        
            }
            else {
                res.status(400).send({
                    errno:"116" ,
                    message : "Incorrect old password."
                })
            }
        }
        catch (error) {
            res.send({errno: 161,
                message : error.message})
        }
    }
    else {
        res.status(400).send({
            errno:"110" ,
            message : "Enter email"
        })
    }
})


module.exports = router