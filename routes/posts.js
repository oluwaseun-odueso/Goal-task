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

router.post('/signUp', async(req, res) => {
    try {
        const username = req.body.username;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const password = req.body.password;
        const confirm_password = req.body.confirm_password;
        await signUp(username, first_name, last_name, email, password, confirm_password, res);
        res.status(201).send("New user added")
    }
    catch(error) {
        res.send({message : error})
    }
})

function signUp(username, first_name, last_name, email, password, confirm_password, res) {
    return new Promise((resolve, reject) => {
        let sql = "INSERT INTO `accounts`(username, first_name, last_name, email, password, confirm_password) VALUES (?, ?, ?, ?, ?, ?)"
    
        connection.query(sql, [username, first_name, last_name, email, password, confirm_password], (error, results, fields) => {
            if (error) reject(error)
            resolve(true)
    })
    })
} 

router.post('/log_in', async(req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        await logIn(username, password, res);
        res.status(201).send("User exists")
    }
    catch(error) {
        if (error == false) {
            res.status(201).send("User does not exist.")
        }
        else {
            res.send({message : error})
        }
    }
})

function logIn(username, password, res) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}'`
        connection.query(sql, (error, results, fields) => {
            if (error) reject(error)
            if (results.length == 1) {
                resolve(true)
            }
            else {
                reject(false)
            }
        });
    })
}

router.post('/add_new_goal', async(req, res) => {
    try {
        const account_id = req.body.account_id
        const category = req.body.category;
        const goal = req.body.goal;
        const goal_status = req.body.goal_status;
        const set_date = new Date()
        await addNewGoal(account_id, category, goal, goal_status, set_date, res)
        res.status(201).send("New goal added")
    }
    catch(error) {
        res.send({message : error})
    }
})

function addNewGoal(account_id, category, goal, goal_status, set_date, res) {
    return new Promise((resolve, reject) => {
        let sql = "INSERT INTO `goals`(account_id, category, goal, goal_status, set_date) VALUES (?, ?, ?, ?, ?)"

        connection.query(sql, [account_id, category, goal, goal_status, set_date], (error, results, fields) => {
            if (error) reject(error)
            resolve(true)
        })
    })
}

module.exports = router