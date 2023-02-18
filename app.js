const express = require('express');
const { cookie }  = require('./db/secret');

// const { connector } = require('./db/connector.js');
const cors = require('cors');
const app = express()

const auth = require('./routes/auth');
/* middlewares */

app.use(require('cookie-parser')(cookie));
app.use(require('express-session')());
app.use( express.static('public') );
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
}));

const { unique_string } = require('./unique_string');

app.use( bodyParser.json({ limit: "50mb" }) );

app.get('/', (req, res) => {
    res.send({ msg: "Hello World" });
})
/* ROUTING */

app.use(`/api/auth`, auth.router);


app.use((req, res, next) => {
    res.send(404, { msg: "404 not found" });
})

app.listen(5000, ()=>{
    console.log("Server running on www://ws:5000");
});
