const express = require('express');
const bodyParser = require('body-parser');
const accountRoute = require('./signupAndLogin/account');
const goalsRoute = require('./routes/goals');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(bodyParser.json());

app.use('/account', accountRoute);
app.use('/goals', goalsRoute);

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Goal Tracker API',
            description: "Official Goal Tracker Page",
            contact: {
                name: "Oluwaseun"
            },
            servers: ["http://localhost:5000"]
        }
    },
    apis: ['server.js', './routes/goals.js', './signupAndLogin/account.js']
    // apis: ["server.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

 

app.get('/', (req, res) => {
    res.send('Home page.');
})

// To listen to the server
app.listen(5000);