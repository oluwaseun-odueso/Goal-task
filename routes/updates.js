const express = require('express');
const connection = require('../server')
require('dotenv').config()

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

function update(userId, property, newValue, res) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE accounts SET ${property} = '${newValue}' WHERE id = ${userId}`
        connection.query(sql, (error, results) => {
            if (error) reject(error);
            resolve(true)
        })
    })
}

module.exports = router;
