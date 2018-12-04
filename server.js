const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('express-flash')

const passport = require('passport');
const passportSocketIo = require('passport.socketio')


const cookieParser = require('cookie-parser')

const config = require('./config/secret');


const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)

const sessionStore = new MongoStore({ url: config.database, autoReconnect: true })

require('./realtime/io')(io);
io.use(passportSocketIo.authorize({
  cookieParser,
  key: 'connect.sid',
  secret: config.secret,
  store: sessionStore,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
}))

function onAuthorizeSuccess(data, accept) {
  //// console.log('Authorize Success!') // first
  accept()
}

function onAuthorizeFail(data, message, error, accept) {
  //// console.log('Authorize Fail!')
  if (error) {
    // thuc ra khong can check error vi se luon co loi
    accept(new Error(message))
  }
}


mongoose.connect(config.database, function(err) {
  if (err) // console.log(err);
  //// console.log("connected to the database");
});
mongoose.Promise = global.Promise;

app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret,
  store: sessionStore,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
}))

app.use(flash())
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

app.use(function(req, res, next) {
  // // console.log('userAllView',req.user) // (luu trong session, neu khong co se tra ve undifined)
  res.locals.userAllView = req.user // xxxx now we can access userAllView variable in every 
  next()
})


const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
app.use(mainRoutes);
app.use(userRoutes);


http.listen(process.env.PORT || 3030, (err) => {
  if (err) // console.log(err);
  // // console.log(`Running on port ${3030}`);
});
