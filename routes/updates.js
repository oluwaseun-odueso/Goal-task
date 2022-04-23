const express = require('express');
const connection = require('./databaseConnection')
const functions = require('./routesFunctions')
require('dotenv').config()
const {update} = functions

const router = express.Router();

router.patch('/:accountId', async(req, res) => {
    try{
        const property = req.body.property;
        const newValue = req.body.newValue;
        const userId = req.params.accountId
        await update(userId, property, newValue, res)
        res.status(201).send("A value has been updated.")
    }
    catch(error) {
        res.send({message : error})
    }
})

router.delete('/:goalId', (req, res) => {
    connection.query(`DELETE FROM goals WHERE id = ${req.params.goalId}`, (error, result) => {
        if (error) throw error
        res.send('A goal has been deleted')
    })
})

module.exports = router;
