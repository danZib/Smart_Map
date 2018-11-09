var express = require("express");
var router = express.Router();

module.exports = function(passport) {
// ROOT ROUTE
// router.get('/', function(req, res) {
//     // Link to documentatio
// });

// // AUTHENTICATION ROUTES
// router.get('/login', function(req, res) {
//     res.render('login');
// });

// router.post('/login', passport.authenticate('local-login',
//     {
//         successRedirect: '/',
//         failureRedirect: '/login'
//     }), function(req, res) {
// });

// router.get('/signup', function(req, res) {
//     res.render('signup');
// });

// router.post('/signup', passport.authenticate('local-signup',
//     {
//         successRedirect: '/',
//         failureRedirect: '/signup'
//     }), function(req, res) {
// });

// router.get('/logout', function(req, res) {
//     req.logout();
//     res.redirect('/');
// });

// // ALL WORKORDERS
// router.get('/workorders', function(req, res) {
//     db.getNodes('Workorder', function(err, workorders) {
//         if (err) {
//             console.log(err);
//             res.redirect('/');
//         } else {
//             res.render('workorders/all', {workorders: workorders});
//         }
//     });
// });

// // Photo Sphere
// router.get('/photosphere', function(req, res) {
//     res.render('photoSphere');
// });
return router;
};
