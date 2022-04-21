const express = require('express');
const connection = require('../server')
require('dotenv').config()

const router = express.Router();

router.delete('/:goalId', (req, res) => {
    connection.query(`DELETE FROM goals WHERE id = ${req.params.goalId}`, (error, result) => {
        if (error) throw error
        res.send('A goal has been deleted')
    })
})

module.exports = router;