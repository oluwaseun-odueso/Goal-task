const express = require('express');
const auth = require('./auth')
const functions = require('../routes/routesFunctions')
const connection = require('./databaseConnection')
require('dotenv').config()

const router = express.Router();
const {generateToken, verifyToken} = auth
const {checkIfEnteredPasswordMatches, 
    checkIfEmailExists, 
    checkIfUserExists, 
    addUserToAccount, 
    addNewGoal, 
    hashEnteredPassword, 
    checkIfEnteredPasswordEqualsHashed,
    collectUsernameHashedPassword} = functions


router.post('/log_in', async(req, res) => {
    if(req.body.username && req.body.password){
        try {
            const results = await checkIfUserExists(req.body.username)
            if (results === true) {
                const hashedPW = await collectUsernameHashedPassword(req.body.username)
                const checkPassword = await checkIfEnteredPasswordEqualsHashed(req.body.password, hashedPW[0].password)
                if (checkPassword === true) {
                    const token = await generateToken(req.body.username)
                    res.status(201).send(token)
                } 
                else res.status(400).send("Incorrect password.")
            }
            else {
                res.status(400).send("Incorrect username")
            }
        }
        catch(error) {
            res.send({message : error})
        }
    }
    else res.status(500).send("All inputs must be entered correctly")
    
    
})


router.post('/signUp', verifyToken, async(req, res) => {
    if(req.body.username && req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.confirm_password) {
        try {
            const check = await checkIfUserExists(req.body.username)
            if (check === false) {
                const checkEmail = await checkIfEmailExists(req.body.email);
                if (checkEmail === false) {
                    await checkIfEnteredPasswordMatches(req.body.password, req.body.confirm_password);
                    const hashedPassword = await hashEnteredPassword(req.body.password)
                    if (hashedPassword == hash) {
                        await addUserToAccount(req.body.username, req.body.first_name, req.body.last_name, req.body.email, hashedPassword);
                        res.status(201).send("New user added")
                    }
                    else {
                        res.status(500).send("Cannot add user")
                    }
                }
                else {
                    res.status(400).send({
                        error:"115" ,
                        message : "Can't add an existing email."
                    })
                }    
            }
            else {
                res.status(400).send({
                    error:"111" ,
                    message : "Can't add an existing username."
                })
            }   
        }
        catch(error) {
            res.send({message : error})
        }
    }
    else res.status(500).send("All fields must be entered correctly")
})

router.post('/add_new_goal', async(req, res) => {
    try {
        await addNewGoal(req.body.account_id, req.body.category, req.body.goal, req.body.goal_status, new Date())
        res.status(201).send("New goal added")
    }
    catch(error) {
        res.send({message : error})
    }
})

module.exports = router