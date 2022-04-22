const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const mySecretKey = process.env.SECRET

function generateToken(user) {
    return new Promise((resolve, reject) => {
        jwt.sign({ user }, mySecretKey, function(err, token) {
            resolve(token)
            reject(err)
        })
    })
}

function verifyToken(req, res, next) {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiU2hhZGllZSIsImlhdCI6MTY1MDU1OTMwNn0.XyZJdCkcURvK4Fmh1CCu0ovESvBIaOMrUYxp9AdG5Qo"
    jwt.verify(token, mySecretKey, function(err, decoded) {
        console.log(decoded) 
    }) 
    next()
}

const tokenFunctions = {
    generateToken,
    verifyToken
}

module.exports = tokenFunctions