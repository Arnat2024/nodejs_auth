const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const jsonParser = bodyParser.json();
app.use(jsonParser);

const port = 8080;


// создание хранилища для сессий 
const sessionHandler = require('./js/session_handler');
const store = sessionHandler.createStore();

// создание сессии 
app.use(cookieParser());
app.use(session({
    store: store,
    resave: false,
    saveUninitialized: true,
    secret: 'supersecret'
}));

const handlers = require('./js/queries');
//const signup = require('./js/signup');
const routes_handler = require('./js/routes')(app);

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('sign_up');
});

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/all', handlers.get_users);

app.post('/login', handlers.check_user);
//app.post('/login', handlers.check_pass);

// регистрация пользователя 
app.post('/signup', handlers.add_user);

// ограничение доступа к контенту на основе авторизации 
app.get('/check', function (req, res) {
    if (req.session.username) {
        res.send('hello, user ' + req.session.username);
    } else {
        res.send('Not logged in(');
    }

});

app.listen(port, function () {
    console.log('app running on port ' + port);
})
