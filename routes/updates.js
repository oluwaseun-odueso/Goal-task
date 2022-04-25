const express = require('express');
const connection = require('./databaseConnection')
const functions = require('./routesFunctions')
const auth = require('../signupAndLogin/auth')
require('dotenv').config()

const {verifyToken} = auth
const {update, addNewGoal, getGoalsForId, deleteGoal, getAccountIdForGoal} = functions

const router = express.Router();

router.patch('/', verifyToken, async(req, res) => {
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

router.delete('/:goalId', verifyToken, async(req, res) => {
    try {
        const accountId = await getAccountIdForGoal(req.params.goalId)
        if (JSON.parse(JSON.stringify(accountId[0])).account_id == req.user.id) {
            await deleteGoal(req.params.goalId)
            res.status(201).send({message : "A goal has been deleted."})
        }
        else (
            res.status(500).send({
                error:"106" ,
                message : "You're unauthorized to delete this goal."
            })
        )
    }
    catch(error) {
        res.send({message : error})
    }
})


router.post('/add_new_goal', verifyToken, async(req, res) => {
    if (req.body.category && req.body.goal && req.body.goal_status) {
        try {
            await addNewGoal(req.user.id, req.body.category, req.body.goal, req.body.goal_status, new Date())
            res.status(201).send("New goal added")
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

router.get('/get_goals_for_id', verifyToken, async(req, res) => {
    try {
        const result = await getGoalsForId(req.user.id)
        res.status(201).send(result)
    }
    catch(error) {
        res.send({message : error})   
    }
})

module.exports = router;
