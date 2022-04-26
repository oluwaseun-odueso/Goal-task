const express = require('express');
const functions = require('./routesFunctions')
const auth = require('../signupAndLogin/auth')
require('dotenv').config()

const {verifyToken} = auth
const {update, 
    addNewGoal, 
    getGoalsForId, 
    deleteGoal, 
    getAccountIdForGoal, 
    returnGoalId, 
    getParticularGoalForId} = functions


const router = express.Router();


router.post('/add_new_goal', verifyToken, async(req, res) => {
    if (req.body.category && req.body.goal && req.body.goal_status) {
        try {
            await addNewGoal(req.user.id, req.body.category, req.body.goal, req.body.goal_status, new Date())
            const goalId = await returnGoalId(req.user.id)
            console.log(JSON.parse(JSON.stringify(goalId[0])).last_entry)
            const goal = await getParticularGoalForId(JSON.parse(JSON.stringify(goalId[0])).last_entry)
            console.log(goal)
            res.status(201).send({
                message : "New goal added", 
                goal})
        }
        catch(error) {
            res.send({errno : 121, message : error})
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

router.get('/get_goals_for_id', verifyToken, async(req, res) => {
    try {
        const result = await getGoalsForId(req.user.id)
        res.status(200).send(result)
    }
    catch(error) {
        res.send({message : error})   
    }
})

module.exports = router;
