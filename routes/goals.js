const express = require('express');
const functions = require('./routesFunctions')
const auth = require('../signupAndLogin/auth')
require('dotenv').config()

const {verifyToken} = auth
const {addNewGoal, 
    getGoalsForId, 
    deleteGoal, 
    getGoalBydate,
    updateGoalProperties,
    getAccountIdForGoal, 
    returnGoalId, 
    getParticularGoalForId} = functions


const router = express.Router();

router.patch('/update_goal', verifyToken, async(req, res) => {
    if (req.body.id && req.body.category && req.body.goal && req.body.goal_status) {
        try {
            await updateGoalProperties(req.body.id, req.body.category, req.body.goal, req.body.goal_status)
            const goal = await getParticularGoalForId(req.body.id)
            res.status(201).send({
                message : "Updated",
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
            res.send({errno : 121, message : error.message})
        }
    }
    else {
        res.status(500).send({
            error:"104" ,
            message : "Property must be entered correctly."
        })
    }
})

router.delete('/delete_goal', verifyToken, async(req, res) => {
    if (req.body.goal_id) {
        try {
            const accountId = await getAccountIdForGoal(req.body.goal_id)
            if (JSON.parse(JSON.stringify(accountId[0])).account_id == req.user.id) {
                await deleteGoal(req.body.goal_id)
                res.status(200).send({message : "A goal has been deleted."})
            }
            else (
                res.status(401).send({
                    error:"106" ,
                    message : "Goal id does not exist within your goal(s)."
                })
            )
        }
        catch(error) {
            res.send({errno : 123, message : error.message})
        }
    }
    else {
        res.status(500).send({
            error:"109" ,
            message : "Property must be entered correctly."
        })
    }
})

router.get('/get_a_goal', verifyToken, async(req, res) => {
    if (req.body.goal_id) {
        try{
            const amount = await getGoalsForId(req.user.id)
            if (amount.length >= 1) {
                const accountId = await getAccountIdForGoal(req.body.goal_id)
                if (JSON.parse(JSON.stringify(accountId[0])).account_id == req.user.id) {
                    const goal = await getParticularGoalForId(req.body.goal_id)
                    res.status(200).send({
                        message : goal})
                }
                else {
                    res.status(401).send({
                        error:"106" ,
                        message : "Goal id does not exist within your goal(s)."
                    })
                }
            }
            else {
                res.status(401).send({message : "You have no goal yet."})
            }
        }
        catch (error) {
            res.send({errno : 124, message : error.message})
        }
    }
    else {
        res.status(500).send({
            error:"109" ,
            message : "Property must be entered correctly."
        })
    }
})

router.get('/get_goals', verifyToken, async(req, res) => {
    try {
        const result = await getGoalsForId(req.user.id)
        if (result.length >= 1) {
            res.status(200).send({message : result})
        }
        else {
            res.status(401).send({message : "You have no goal yet."})
        }
    }
    catch(error) {
        res.send({errno : 142, message : error.message})   
    }
})

router.get('/get_goal_by_date', verifyToken, async(req, res) => {
    if (req.body.goal_date) {
        try {
            const result = await getGoalBydate(req.body.goal_date, req.user.id)
            if (result.length >= 1) {
                res.status(200).send({message : result})
            }
            else {
                res.status(401).send({message : "You have no goal from this date."})
            }
        }
        catch (error) {
            res.send({errno : 144, message : error.message})
        }
    }
    else {
        res.status(500).send({
            error:"109" ,
            message : "Property must be entered correctly."
        })
    }
})

module.exports = router;
