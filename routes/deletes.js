const express = require('express');
const mysql = require('mysql');
require('dotenv').config()

const router = express.Router();


// Connect to Database
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
    // insecureAuth : true 
});

connection.connect();

router.delete('/:goalId', (req, res) => {
    connection.query(`DELETE FROM goals WHERE id = ${req.params.goalId}`, (error, result) => {
        if (error) throw error
        res.send('A goal has been deleted')
    })
})

module.exports = router;