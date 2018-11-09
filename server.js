// INCLUDES
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var graphDb = require('./graph_db');
var methodOverride = require('method-override');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var cors = require('cors');

// APP
var app = express();

// GLOBAL
db = new graphDb();

// AUTHENTICATION
app.use(session({
    secret:'finnish forests are wonderful woods with titanic trees',
    resave: false,
    saveUninitialized: false
    }));

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport, db);

// ROUTES
var indexRoutes = require('./routes/index')(passport);
var storeyRoutes = require('./routes/storey');
var spaceRoutes = require('./routes/space');
var forgeRoutes = require('./routes/forge/forge');

// MIDDLEWARE
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })); // get data from html forms
app.use(express.static(__dirname + '/public')); // include static data
app.use(methodOverride('_method')); // support put and delete requests
app.use(flash());
app.set('view engine', 'ejs'); // make ejs standard view format
app.use(cors())
app.use(function(req, res, next) {
    res.locals.currentUser = req.user; // provides the req.user to all tempaltes as currentUser
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use('/', indexRoutes);
app.use('/api/forge/', forgeRoutes);
app.use('/api/building/:buildingId/', indexRoutes);
app.use('/api/building/:buildingId/storey', storeyRoutes);
app.use('/api/building/:buildingId/storey/:level/space', spaceRoutes);
// app.use('/api/rooms/:guid/workorders', workorderRoutes);

// LISTEN
app.listen(3000, function() {
    console.log('Backend is running on port 3000...')
});
