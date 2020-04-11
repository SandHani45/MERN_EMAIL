const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const passport = require('passport');
const { jwtSecret, facebookClientID, facebookClientSecret } = require('./vars');
const User = require('../api/models/user.model');
const FacebookTokenStrategy = require('passport-facebook-token');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

const jwt = async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};
exports.jwt = new JwtStrategy(jwtOptions, jwt);

passport.use('facebookToken', new FacebookTokenStrategy({
  clientID: facebookClientID,
  clientSecret: facebookClientSecret,
  passReqToCallback: true,
  callbackURL: "http://localhost:5000/auth/facebook/callback"
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    let url = "https://graph.facebook.com/v3.2/me?" +
                  "fields=id,name,email,first_name,last_name&access_token=" + accessToken;
    console.log('profile', profile);
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    
    if (req.user) {
      // We're already logged in, time for linking account!
      // Add Facebook's data to an existing account
      req.user.methods.push('user')
      req.user.facebook = {
        id: profile.id,
        email: profile.emails[0].value
      }
      await req.user.save();
      return done(null, req.user);
    } else {
      // We're in the account creation process
      let existingUser = await User.findOne({ "facebook.id": profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }

      // Check if we have someone with the same email
      existingUser = await User.findOne({ "email": profile.emails[0].value })
      if (existingUser) {
        // We want to merge facebook's data with local auth
        existingUser.methods.push('facebook')
        existingUser.facebook = {
          id: profile.id,
          email: profile.emails[0].value
        }
        await existingUser.save()
        return done(null, existingUser);
      }

      const newUser = new User({
        methods: ['facebook'],
        email: profile.emails[0].value,
        isVerify:true,
        facebook: {
          id: profile.id
        }
      });

      await newUser.save();
      done(null, newUser);
    }
  } catch(error) {
    done(error, false, error.message);
  }
}));

// Google OAuth Strategy
passport.use('googleToken', new GooglePlusTokenStrategy({
  clientID:'582541782490-s7g4dsumm8o9jqci7b9v2cu9d85glubg.apps.googleusercontent.com',
  clientSecret: 'NgxBW-JUZdj_EFrJywGlk9Wx',
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Could get accessed in two ways:
    // 1) When registering for the first time
    // 2) When linking account to the existing one

    // Should have full user profile over here
    console.log('accessToken', accessToken);
    console.log('profile--------', profile.emails[0].value);
    console.log('refreshToken', refreshToken);

    if (req.user) {
      // We're already logged in, time for linking account!
      // Add Google's data to an existing account
      req.user.methods.push('google')
      req.user.google = {
        id: profile.id
      }
      await req.user.save()
      return done(null, req.user);
    } else {
      // We're in the account creation process
      let existingUser = await User.findOne({ "google.id": profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }

      // Check if we have someone with the same email
      existingUser = await User.findOne({ "email": profile.emails[0].value })
      if (existingUser) {
        // We want to merge google's data with local auth
        existingUser.methods.push('google')
        existingUser.google = {
          id: profile.id
        }
        await existingUser.save()
        return done(null, existingUser);
      }

      const newUser = new User({
        methods: ['google'],
        email: profile.emails[0].value,
        google: {
          id: profile.id
        }
      });
  
      await newUser.save();
      done(null, newUser);
    }
  } catch(error) {
    done(error, false, error.message);
  }
}));

// // Twitter OAuth Strategy
// passport.use('twitterToken', new TwitterokenStrategy({
//   clientID:'',
//   clientSecret: '',
//   passReqToCallback: true,
// }, async (req, accessToken, refreshToken, profile, done) => {
//   try {
//     // Could get accessed in two ways:
//     // 1) When registering for the first time
//     // 2) When linking account to the existing one

//     // Should have full user profile over here
//     console.log('accessToken', accessToken);
//     console.log('profile--------', profile.emails[0].value);
//     console.log('refreshToken', refreshToken);

//     if (req.user) {
//       // We're already logged in, time for linking account!
//       // Add Google's data to an existing account
//       req.user.methods.push('twitter')
//       req.user.google = {
//         id: profile.id        
//       }
//       await req.user.save()
//       return done(null, req.user);
//     } else {
//       // We're in the account creation process
//       let existingUser = await User.findOne({ "twitter.id": profile.id });
//       if (existingUser) {
//         return done(null, existingUser);
//       }

//       // Check if we have someone with the same email
//       existingUser = await User.findOne({ "email": profile.emails[0].value })
//       if (existingUser) {
//         // We want to merge google's data with local auth
//         existingUser.methods.push('google')
//         existingUser.google = {
//           id: profile.id
//         }
//         await existingUser.save()
//         return done(null, existingUser);
//       }

//       const newUser = new User({
//         methods: ['twitter'],
//         email: profile.emails[0].value,
//         google: {
//           id: profile.id
//         }
//       });
  
//       await newUser.save();
//       done(null, newUser);
//     }
//   } catch(error) {
//     done(error, false, error.message);
//   }
// }));