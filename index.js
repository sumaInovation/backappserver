const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const express=require('express')
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config()
const app = express();
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret:process.env.CLIENT_SECRET,
  callbackURL: 'https://loginserver-bky1de3y.b4a.run/auth/google/callback'
},
function(accessToken, refreshToken, profile, done) {
  // Here you would typically save the user's profile information to your database
  // For now, we'll just pass the profile through
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(cors({
  origin:"*"
}))



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
  res.send(`<h2>Hello welocome to ${req.user.displayName}</h2></h2><img src=${req.user.photos[0].value} alt="alternatetext">
    <h3></h3><a href="/logout">login out</a></h3> `)
  } else {
    res.send('Hello, please <a href="/auth/google">login with Google</a>');
  }
});


app.get("/logout",(req,res)=>{
  req.logout(()=>{

  });
  res.redirect('/')
 // res.send("HELLO")
  });
app.get("/login/failed",(req,res)=>{
    res.status(401).json({
        error:true,
        message:"Login in Falier",
    })
});
app.get("/login/success",(req,res)=>{
if(req.user){
res.status(200).json({
    error:false,
    message:"Successfully login",
    user:req.user,
})
}else{
res.status(403).json({
    error:true,
    message:"Not Authorized"
});

}
});


app.listen(5000, () => {
  console.log('Server started on http://localhost:3000');
});   



// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log("MongoDB Connected");
})
.catch(()=>{
    console.log("Failed to connect mongoDB");
})   
