const express = require('express');
const { is } = require('express/lib/request');
const req = require('express/lib/request');
const { set, json } = require('express/lib/response');
const res = require('express/lib/response');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
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

// Necessary functions
function checkIfEnteredPasswordMatches(password, confirm_password) {
    console.log(password, confirm_password)
    return new Promise((resolve, reject) => {
        if (password === confirm_password){
            resolve(true)
        }
        else {
            reject(false)
        }
    })
}

function checkIfUserExists(username) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM accounts WHERE username = '${username}'`
        connection.query(sql, (error, results, fields) => {
            if (error) reject(error)
            if (results.length == 1) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        });
    })
}

function checkIfEmailExists(email) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM accounts WHERE email = '${email}'`
        connection.query(sql, (error, results, fields) => {
            if (error) reject(error)
            if (results.length == 1) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        });
    })
}

function addUserToAccount(username, first_name, last_name, email, password, confirm_password) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO accounts (username, first_name, last_name, email, password, confirm_password) VALUES ('${username}', '${first_name}', '${last_name}', '${email}', '${password}', '${confirm_password}')`
        connection.query(sql, (error, results, fields) => {
            if (error) reject(error)
            resolve(true)
        })
    })
} 

function addNewGoal(account_id, category, goal, goal_status, set_date) {
    return new Promise((resolve, reject) => {
        let sql = "INSERT INTO `goals`(account_id, category, goal, goal_status, set_date) VALUES (?, ?, ?, ?, ?)"
        connection.query(sql, [account_id, category, goal, goal_status, set_date], (error, results, fields) => {
            if (error) reject(error)
            resolve(true)
        })
    })
}

function hashEnteredPassword(password) {
    return new Promise((resolve, reject) => {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, function(err, hash) {
            resolve(hash)
        });
    })
}

function checkIfEnteredPasswordEqualsHashed(password, hashedPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, function(err, result) {
            resolve(result)
        });
    })
}

function collectUsernameHashedPassword(username) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT password FROM accounts WHERE username = '${username}'`;
        connection.query(sql, (error, results, fields) => {
            if (error) reject(error)
            resolve(results)
        })
    })
}

router.post('/log_in', async(req, res) => {
    if(req.body.username && req.body.password){
        try {
            const results = await checkIfUserExists(req.body.username)
            if (results === true) {
                const hashedPW = await collectUsernameHashedPassword(req.body.username)
                const checkPassword = await checkIfEnteredPasswordEqualsHashed(req.body.password, hashedPW[0].password)
                if (checkPassword === true) {
                    res.status(201).send("You're logged in")
                } 
                else res.status(400).send("Incorrect password.")
            }
            else {
                res.status(400).send("Incorrect username")
            }
        }
        catch(error) {
            res.send({message : error})
        }
    }
    else res.status(500).send("All inputs must be entered correctly")
    
    
})

router.post('/signUp', async(req, res) => {
    if(req.body.username && req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.confirm_password) {
        try {
            const check = await checkIfUserExists(req.body.username)
            if (check === false) {
                const checkEmail = await checkIfEmailExists(req.body.email);
                if (checkEmail === false) {
                    await checkIfEnteredPasswordMatches(req.body.password, req.body.confirm_password);
                    const hashedPassword = await hashEnteredPassword(req.body.password)
                    await addUserToAccount(req.body.username, req.body.first_name, req.body.last_name, req.body.email, hashedPassword, hashedPassword);
                    res.status(201).send("New user added")
                }
                else {
                    res.status(201).send({
                        error:"115" ,
                        message : "Can't add an existing email."
                    })
                }    
            }
            else {
                res.status(201).send({
                    error:"111" ,
                    message : "Can't add an existing username."
                })
            }   
        }
        catch(error) {
            res.send({message : error})
        }
    }
    else res.status(500).send("All fields must be entered correctly")
})

router.post('/add_new_goal', async(req, res) => {
    try {
        await addNewGoal(req.body.account_id, req.body.category, req.body.goal, req.body.goal_status, new Date())
        res.status(201).send("New goal added")
    }
    catch(error) {
        res.send({message : error})
    }
})

module.exports = router