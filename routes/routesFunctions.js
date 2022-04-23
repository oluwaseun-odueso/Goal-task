const express = require('express');
const connection = require('./databaseConnection')
const bcrypt = require('bcrypt');
require('dotenv').config()


// Necessary functions
function checkIfEnteredPasswordMatches(password, confirm_password) {
    // console.log(password, confirm_password)
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
            resolve(result)
            reject(err)
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

function update(userId, property, newValue, res) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE accounts SET ${property} = '${newValue}' WHERE id = ${userId}`
        connection.query(sql, (error, results) => {
            if (error) reject(error);
            resolve(true)
        })
    })
}

const routesFunctions = {
    checkIfEnteredPasswordMatches,
    checkIfEmailExists,
    checkIfUserExists,
    addUserToAccount,
    addNewGoal,
    hashEnteredPassword,
    checkIfEnteredPasswordEqualsHashed,
    collectUsernameHashedPassword,
    update
}

module.exports = routesFunctions