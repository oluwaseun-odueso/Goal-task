const express = require('express');
const bodyParser = require('body-parser');
const postsRoute = require('./signupAndLogin/posts');
const updatesRoute = require('./routes/updates');
const app = express();

app.use(bodyParser.json());
app.use('/posts', postsRoute);
app.use('/updates', updatesRoute);

// Connect to Database



// Get all
app.get('/', (req, res) => {
    res.send('Welcome to the official goal tracker page.');
})

// To listen to the server
app.listen(5000);

