const express = require('express');
const auth = require('./auth')
const nodemailer = require('nodemailer');
const functions = require('../routes/routesFunctions')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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

/**
 * @swagger
 * /account/login:
 *   post:
 *     summary: Logs in a user
 *     description: Logs in a user into their account using their username and password.
 *     comsumes:
 *       - application/json
 *     produces: 
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: user_login_details
 *       schema: 
 *         type: object
 *         properties: 
 *           username:
 *             type: string
 *             required: true
 *           password:
 *             type: string
 *             required: true
 *     responses:
 *       200: 
 *         description: You have successfully logged in.
 *         schema: 
 *           type: object
 *           properties: 
 *             message:
 *               type: string
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 username:
 *                   type: string
 *                 first_name: 
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email: 
 *                   type: string
 *             token:
 *               type: string
 *       401:
 *         description: Incorrect password
 *         schema:
 *           type: object
 *           properties:
 *             errno:
 *               type: string
 *             message:
 *               type: string
 *       400:
 *         description: Username does not exist
 *         schema:
 *           type: object
 *           properties:
 *             errno: 
 *               type: string
 *             message:
 *               type: string
 *       500:
 *         description: All properties must be entered correctly
 *         schema:
 *           type: object
 *           properties:
 *             errno: 
 *               type: string
 *             message:
 *               type: string
 */

router.post('/login', async(req, res) => {
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
                    res.status(401).send({
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
            message : "All properties must be entered correctly"
        })
    }    
})

/**
 * @swagger
 * /account/signUp:
 *   post:
 *     summary: Sign up a new user
 *     description: Creates account for a new user
 *     comsumes:
 *       - application/json
 *     produces: 
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: user_sign_up_details
 *       schema: 
 *         type: object
 *         properties: 
 *           username:
 *             type: string
 *             required: true
 *           first_name:
 *             type: string
 *             required: true
 *           last_name:
 *             type: string
 *             required: true
 *           email:
 *             type: string
 *             required: true
 *           password:
 *             type: string
 *             required: true
 *           confirm_password:
 *             type: string
 *             required: true
 *     responses:
 *       201: 
 *         description: New user added.
 *         schema: 
 *           type: object
 *           properties: 
 *             message:
 *               type: string
 *       400:
 *         description: Passwords don't match or cannot add an existing username or cannot add an existing username.
 *         schema:
 *           type: object
 *           properties:
 *             errno:
 *               type: string
 *             message:
 *               type: string
 *       500:
 *         description: All properties must be entered correctly
 *         schema:
 *           type: object
 *           properties:
 *             errno: 
 *               type: string
 *             message:
 *               type: string
 */

router.post('/signUp', async(req, res) => {
    console.log(req.body)
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
                        message : "Cannot add an existing email."
                    })
                }    
            }
            else {
                res.status(400).send({
                    errno:"111" ,
                    message : "Cannot add an existing username."
                })
            }   
        }
        catch(error) {
            res.send({message : error.message})
        }
    }
    else res.status(500).send({
        errno : "101", 
        message : "All properties must be entered correctly"})
})

/**
 * @swagger
 * /account/update_account_details:
 *   patch:
 *     summary: Updates a user's account details
 *     description: Updates user's account details
 *     comsumes:
 *       - application/json
 *     produces: 
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: new_user_details
 *       schema: 
 *         type: object
 *         properties: 
 *           first_name:
 *             type: string
 *             required: true
 *           last_name:
 *             type: string
 *             required: true
 *           email:
 *             type: string
 *             required: true
 *     responses:
 *       201: 
 *         description: Updated.
 *         schema: 
 *           type: object
 *           properties: 
 *             message:
 *               type: string
 *             details:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 username:
 *                   type: string
 *                 first_name: 
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email: 
 *                   type: string
 *       500:
 *         description: All properties must be entered correctly
 *         schema:
 *           type: object
 *           properties:
 *             errno: 
 *               type: string
 *             message:
 *               type: string
 */

router.patch('/update_account_details', verifyToken, async(req, res) => {
    if (req.body.first_name && req.body.last_name && req.body.email) {
        try {
            await updateAccountProperties(req.body.first_name, req.body.last_name, req.body.email, req.user.id)
            const details = await getBasicUserDetailsById(req.user.id)
            res.status(201).send({
                message : "Updated.",
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


/**
 * @swagger
 * /account/change_password:
 *   patch:
 *     summary: Change user password
 *     description: Helps a user change their password
 *     comsumes:
 *       - application/json
 *     produces: 
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: change_password_details
 *       schema: 
 *         type: object
 *         properties: 
 *           old_password:
 *             type: string
 *             required: true
 *           new_password:
 *             type: string
 *             required: true
 *           confirm_password:
 *             type: string
 *             required: true
 *     responses:
 *       201: 
 *         description: Password updated!
 *         schema: 
 *           type: object
 *           properties: 
 *             message:
 *               type: string
 *       400:
 *         description: Passwords don't match or Incorrect old password.
 *         schema:
 *           type: object
 *           properties:
 *             errno: 
 *               type: string
 *             message:
 *               type: string
 *       500:
 *         description: All properties must be entered correctly
 *         schema:
 *           type: object
 *           properties:
 *             errno: 
 *               type: string
 *             message:
 *               type: string
 */


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
                        message: "Password updated!"
                        // message : "Password updated, your new password is " + (req.body.new_password).toString()
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


/**
 * @swagger
 * /account/reset_password:
 *   patch:
 *     summary: Resets password
 *     description: Helps a user who forgot their password reset their password
 *     comsumes:
 *       - application/json
 *     produces: 
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: reset_password_details
 *       schema: 
 *         type: object
 *         properties: 
 *           reset_token:
 *             type: string
 *             required: true
 *           new_password:
 *             type: string
 *             required: true
 *     responses:
 *       201: 
 *         description: Your password has been reset, please login.
 *         schema: 
 *           type: object
 *           properties: 
 *             message:
 *               type: string
 *       500:
 *         description: Enter reset password token and new password
 *         schema:
 *           type: object
 *           properties:
 *             errno: 
 *               type: string
 *             message:
 *               type: string
 */

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
                    errno:"116",
                    message : "Email does not exist on profile."
                })
            }
        }
        catch (error) {
            res.send({errno: 161,
                message : error.message})
        }
    }
    else {
        res.status(500).send({
            errno:"110" ,
            message : "Enter email"
        })
    }
})


module.exports = router