const mysql = require('mysql');

var connection = mysql.createConnection({
    host     : process.env.PRODUCTION_HOST,
    user     : process.env.PRODUCTION_USER,
    password : process.env.PRODUCTION_PASSWORD,
    database : process.env.PRODUCTION_DATABASE 
});

connection.connect(() => {
    console.log('Database has been connected')
});

module.exports = connection
