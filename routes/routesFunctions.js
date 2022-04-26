const express = require('express');
const connection = require('./databaseConnection')
const bcrypt = require('bcrypt');
require('dotenv').config()


// Necessary functions
function getAccountIdForGoal(goalId) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT account_id FROM goals WHERE id = ${goalId}`, (error, result) => {
            if (error) reject(error)
            resolve(result)
        })
    })
}

function deleteGoal(id) {
    return new Promise((resolve, reject) => {
        connection.query(`DELETE FROM goals WHERE id = ${id}`, (error, result) => {
            if (error) reject(error)
            resolve(true)
        })
    })
}

function returnGoalId(account_id){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT MAX(id) AS last_entry FROM goals WHERE account_id = ${account_id}`, (error, result) => {
            if (error) reject(error)
            // console.log(result)
            resolve(result)
        })
    })
}

function getParticularGoalForId(goalId) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM goals WHERE id = ${goalId};`, (error, result) => {
            if (error) reject(error)
            resolve(result)
        })
    })
}

function getGoalsForId(accountId) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM goals WHERE account_id = ${accountId}`, (error, result) => {
            if (error) reject(error)
            resolve(result)
        })
    })
}

function propertyValue (username, property) {
    return new Promise((resolve, reject) => {
        // SELECT password FROM accounts WHERE username = 'Temitee';
        let sql = `SELECT ${property} FROM accounts WHERE username = '${username}'`;
        connection.query(sql, (error, results, fields) => {
            if (error) reject(error)
            resolve(results)
        })
    })
}

function getBasicUserDetails (username) {
    return new Promise((resolve, reject) => {
        // SELECT password FROM accounts WHERE username = 'Temitee';
        let sql = `SELECT id, username, first_name, last_name, email FROM accounts WHERE username = '${username}'`;
        connection.query(sql, (error, results, fields) => {
            if (error) reject(error)
            resolve(results)
        })
    })
}

function checkIfEnteredPasswordMatches(password, confirm_password) {
    // console.log(password, confirm_password)
    return new Promise((resolve, reject) => {
        if (password === confirm_password){
            resolve(true)
        } 
        else {
            resolve(false)
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

function addUserToAccount(username, first_name, last_name, email, password) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO accounts (username, first_name, last_name, email, password) VALUES ('${username}', '${first_name}', '${last_name}', '${email}', '${password}')`
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
            reject(err)
        });
    })
}

function checkIfEnteredPasswordEqualsHashed(password, hashedPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, function(err, result) {
            if (err) reject(err)
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

function update(userId, property, newValue) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE accounts SET ${property} = '${newValue}' WHERE id = ${userId}`
        connection.query(sql, (error, results) => {
            if (error) reject(error);
            resolve(true)
        })
    })
}

const routesFunctions = {
    propertyValue,
    checkIfEnteredPasswordMatches,
    checkIfEmailExists,
    checkIfUserExists,
    addUserToAccount,
    addNewGoal,
    hashEnteredPassword,
    checkIfEnteredPasswordEqualsHashed,
    collectUsernameHashedPassword,
    update, 
    returnGoalId,
    getParticularGoalForId,
    deleteGoal,
    getGoalsForId,
    getAccountIdForGoal,
    getBasicUserDetails
}

module.exports = routesFunctions