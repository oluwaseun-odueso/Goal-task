const express = require('express');
const bodyParser = require('body-parser');
// const exphbs = require('express-handlebars');
// const nodemailer = require('nodemailer')
const accountRoute = require('./signupAndLogin/account');
const goalsRoute = require('./routes/goals');

const app = express();

// // View engine setup
// app.engine('handlebars', exphbs());
// app.set('view engine', 'handlebars');

// // Body Parser Middleware
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/account', accountRoute);
app.use('/goals', goalsRoute);


// Get all
app.get('/', (req, res) => {
    res.send('Welcome to the official goal tracker page.');
})

// To listen to the server
app.listen(5000);


