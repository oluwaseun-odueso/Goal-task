const express = require('express');
const auth = require('./auth')
const functions = require('../routes/routesFunctions')
const connection = require('../routes/databaseConnection')
require('dotenv').config()

const router = express.Router();
const {generateToken, verifyToken} = auth
const {checkIfEnteredPasswordMatches, 
    checkIfEmailExists, 
    checkIfUserExists, 
    update,
    addUserToAccount, 
    hashEnteredPassword, 
    getBasicUserDetails,
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
                    const userDetails = await getBasicUserDetails(req.body.username)
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
            res.send({message : error})
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
            const check = await checkIfUserExists(req.body.username)
            if (check === false) {
                const checkEmail = await checkIfEmailExists(req.body.email);
                if (checkEmail === false) {
                    const checkPW = await checkIfEnteredPasswordMatches(req.body.password, req.body.confirm_password);
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
            res.send({message : error})
        }
    }
    else res.status(500).send({
        errno : "101", 
        message : "All fields must be entered correctly"})
})

router.patch('/update_account_details', verifyToken, async(req, res) => {
    if (req.body.property && req.body.newValue) {
        try{
            await update(req.user.id, req.body.property, req.body.newValue)
            res.status(201).send({message : "A value has been updated."})
        }
        catch(error) {
            res.send({message : error})
        }
    }
    else {
        res.status(500).send({
            error:"104" ,
            message : "Property must be entered correctly."
        })
    }
})

module.exports = router