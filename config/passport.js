var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, db) {

    passport.serializeUser(function(user, done) {
        done(null, user.localEmail);
    });

    // used to deserialize the user
    passport.deserializeUser(function(localEmail, done) {
        db.getUserByEmail(localEmail, function(err, user) {
            if (err) {
                return next(err);
            } else {
                return done(err, user);
            }
        });
    });

    // Local Login ==================================

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        process.nextTick(function() {
            db.getUserByEmail(email, function(err, user) {
                if (err) {
                    return done(err);
                } else if (!user) {
                    return done(null, false, req.flash('error', 'Email was not found.'));
                } else if (!db.validPassword(password, user.localPassword)) {
                    return done(null, false, req.flash('error', 'Oopps! Wrong password.'));
                } else {
                    return done(null, user);
                }
            });
        });
    }));

    // Local SignUp ==================================

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        process.nextTick(function() {
            db.getUserByEmail(email, function(err, existingUser) {
                if(err) {
                    return done(err);
                } else if (existingUser) {
                    return done(null, false, 'That email is already in use.');
                } else if (req.user) {
                    var updateUser = {};
                    updateUser.localEmail = email;
                    updateUser.localPassword = db.generateHash(password);

                    db.updateUser(updateUser, function(err, updatedUser) {
                        if (err) {
                            throw err;
                        } else {
                            return done(null, updatedUser);
                        }
                    });
                } else {
                    var newUser = {};
                    newUser.localEmail = email;
                    newUser.localPassword = db.generateHash(password);
                    db.createUser(newUser, function(err, user) {
                        if (err) {
                            return done(err);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        });
    }));
}
