const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const pool = require('../db/connection');

// Ensure environment variables are loaded
require('dotenv').config();
// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const client = await pool.connect();
      
      // Check if user exists
      const existingUser = await client.query(
        'SELECT * FROM users WHERE google_id = $1 OR email = $2',
        [profile.id, profile.emails[0].value]
      );

      if (existingUser.rows.length > 0) {
        // User exists, update google_id if needed
        const user = existingUser.rows[0];
        if (!user.google_id) {
          await client.query(
            'UPDATE users SET google_id = $1, is_verified = true WHERE id = $2',
            [profile.id, user.id]
          );
        }
        client.release();
        return done(null, user);
      } else {
        // Create new user
        const newUser = await client.query(
          `INSERT INTO users (name, email, google_id, is_verified, role, provider) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [
            profile.displayName,
            profile.emails[0].value,
            profile.id,
            true,
            'user',
            'google'
          ]
        );
        
        client.release();
        return done(null, newUser.rows[0]);
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth credentials not found. Google login will be disabled.');
}

// JWT Strategy
if (process.env.JWT_SECRET) {
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }, async (payload, done) => {
    try {
      const client = await pool.connect();
      const user = await client.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
      client.release();
      
      if (user.rows.length > 0) {
        return done(null, user.rows[0]);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.error('JWT Strategy error:', error);
      return done(error, false);
    }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const client = await pool.connect();
    const user = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    client.release();
    
    if (user.rows.length > 0) {
      done(null, user.rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    console.error('Deserialize user error:', error);
    done(error, null);
  }
});