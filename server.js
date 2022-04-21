const express = require('express');
const bodyParser = require('body-parser');
const postsRoute = require('./routes/posts');
const updatesRoute = require('./routes/updates');
const mysql = require('mysql');
const deletesRoute = require('./routes/deletes');
const app = express();

app.use(bodyParser.json());
app.use('/posts', postsRoute);
app.use('/updates', updatesRoute);
app.use('/deletes', deletesRoute);

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

// Get all
app.get('/', (req, res) => {
    res.send('Welcome to the official goal tracker page.');
})

// To listen to the server
app.listen(5000);

module.exports = connection;