
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
var Userdb = require('../models/userModel')
const passport = require('passport')

passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await Userdb.findOne({ email: email });
  
        if (!user) {
          return done(null, false, { message: 'No user with that email' });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (isMatch) {
          const id = user._id.toString();
          const statususer = await Userdb.findByIdAndUpdate({_id:id},{$set:{status:'active'}})
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password Incorrect' });
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Userdb.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

module.exports = passport