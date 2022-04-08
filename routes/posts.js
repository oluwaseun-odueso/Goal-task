const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const mysql = require('mysql');
require('dotenv').config()
const router = express.Router();

// Connect to Database
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE 
});

connection.connect(() => {
    console.log('Database has been connected')
});

router.post('/signUp', (req, res) => {
    const username = req.body.username;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    signUp(username, first_name, last_name, email, password, confirm_password, res);
})

function signUp(username, first_name, last_name, email, password, confirm_password, res) {
    let sql = "INSERT INTO `accounts`(username, first_name, last_name, email, password, confirm_password) VALUES (?, ?, ?, ?, ?, ?)"
    
    connection.query(sql, [username, first_name, last_name, email, password, confirm_password], (error, results, fields) => {
        if (error) throw error
        res.status(201).send("New user added")
    })
} 

router.post('/log_in', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    logIn(username, password, res);
})

function logIn(username, password, res) {
    let sql = `SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}'`
    connection.query(sql, (error, results, fields) => {
        if (error) throw error

        if (results.length == 1) {
            res.status(201).send("User exists")
        }
        else {
            res.status(201).send("User does not exist.")
        }

        // res.status(201).send(results[0].length)
    });
}

router.post('/add_new_goal', (req, res) => {
    const account_id = req.body.account_id
    const category = req.body.category;
    const goal = req.body.goal;
    const goal_status = req.body.goal_status;
    const set_date = new Date()
    // const date = req.body.date;
    addNewGoal(account_id, category, goal, goal_status, set_date, res)
})

function addNewGoal(account_id, category, goal, goal_status, set_date, res) {
    let sql = "INSERT INTO `goals`(account_id, category, goal, goal_status, set_date) VALUES (?, ?, ?, ?, ?)"

    connection.query(sql, [account_id, category, goal, goal_status, set_date], (error, results, fields) => {
        if (error) throw error
        res.status(201).send("New goal added")
    })
}

module.exports = router