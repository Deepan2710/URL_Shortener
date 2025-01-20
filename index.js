import express from 'express';
import mongoose from 'mongoose';
import get_url from './controller/url.js';
import redirect_url from './controller/url_get.js';
import url_Analytics from './controller/url_analytic.js';
import topic_url from './controller/url_topic.js';
import overall_url from './controller/url_overall.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from 'redis';
dotenv.config();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import User from './models/user.js';
const app = express();
console.log("nodemon");
mongoose.connect("mongodb+srv://deepanvenkat06:deepanvenkat06@cluster0.6a4sy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log("Connect");
  }) 
  .catch((err) => {
    console.error("connection error:", err);
  });

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 3600000, 
      },
    })
  );
  

app.use(passport.initialize());
app.use(passport.session());

passport.use(
 new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:2710/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("User authenticated:", profile);
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) { 
           user = new User({
            googleId: profile.id, 
            name: profile.displayName,
            email: profile.emails[0].value,
            createdAt:new Date()
          });
          await user.save();
        }
      } catch (err) {
        console.error('Error in Google Strategy:', err);
        return done(err, null);
      }
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

//APIs
app.post("/api/shorten", get_url);
app.get("/api/analytics/:alias", url_Analytics);
app.get('/api/shorten/:alias', redirect_url);
app.get('/api/analytics/topic/:topic', topic_url);
app.get('/overall', overall_url);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
  }),
  (req, res) => {
    res.redirect('/button');
  }
);

app.get('/auth/failure', (req, res) => {
  res.send('Authentication failed');
});

app.get('/button', (req, res) => {
  res.render('index');
});

app.get('/', (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
}); 

let client = null;
(async () => {
  try {
    client = createClient({
      host: '127.0.0.1',
      port: 6379,
    });
 
    client.on('connect', () => {
      console.log('Connected to Redis!');
    });

    await client.connect();
  } catch (err) {
    client = null;    
  }
})();
const port=process.env.PORT || 2710 ;
app.listen(port, () => { 
  console.log("Server running");
});  

export default client;  