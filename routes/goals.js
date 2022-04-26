const express = require('express');
const functions = require('./routesFunctions')
const auth = require('../signupAndLogin/auth')
require('dotenv').config()

const {verifyToken} = auth
const {addNewGoal, 
    getGoalsForId, 
    deleteGoal, 
    editProperties,
    getAccountIdForGoal, 
    returnGoalId, 
    getParticularGoalForId} = functions


const router = express.Router();

router.patch('/update_goal', verifyToken, async(req, res) => {
    if (req.body.id && req.body.category && req.body.goal && req.body.goal_status) {
        try {
            await editProperties(req.body.id, req.body.category, req.body.goal, req.body.goal_status)
            const goal = await getParticularGoalForId(req.body.id)
            res.status(201).send({
                message : "Changes updated",
                goal
            })
        }
        catch(error) {
            res.send({errno : 122, message : error.message})
        }
    }
    else {
        res.status(500).send({
            error:"109" ,
            message : "Property must be entered correctly."
        })
    }
})

router.post('/add_new_goal', verifyToken, async(req, res) => {
    if (req.body.category && req.body.goal && req.body.goal_status) {
        try {
            await addNewGoal(req.user.id, req.body.category, req.body.goal, req.body.goal_status, new Date())
            const goalId = await returnGoalId(req.user.id)
            const goal = await getParticularGoalForId(JSON.parse(JSON.stringify(goalId[0])).last_entry)
            res.status(201).send({
                message : "New goal added", 
                goal
            })
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
        res.send({errno : 123, message : error})
    }
})

router.get('/get_goals', verifyToken, async(req, res) => {
    try {
        const result = await getGoalsForId(req.user.id)
        res.status(200).send(result)
    }
    catch(error) {
        res.send({errno : 1242, message : error})   
    }
})

module.exports = router;
