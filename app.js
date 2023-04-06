require("dotenv").config();
const express= require("express")
const mongoose=require("mongoose")
const session=require("express-session");
const passport=require("passport");
const GoogleStrategy=require("passport-google-oauth20").Strategy
const User =require("./Userschema.js")
const connect=require("./db.js")


const app=express();

//connecting with the local database
connect()


//setting the engine template
app.set('view engine','ejs') //name must be "ejs" here


//We are telling our app to use session package with some initial configuration
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: false }
}))

//Now we tell our app to use passport package And to initialize passport package
//And to also use passport for dealing with the sessions
app.use(passport.initialize());
app.use(passport.session());


passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  scope:['profile']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log(profile)
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      return done(null, user);
    } else {
      const newUser = new User({
        googleId: profile.id
      });
      user = await newUser.save();
      return done(null, user);
    }
  } catch (error) {
    console.error(error);
    return done(error, null);
  }
}));


passport.serializeUser((user, done)=> {
  done(null, user.id); 
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err, null));
});

app.get('/',(req,res)=>{
    res.send("HOME")
})


  
app.get('/login',(req,res)=>{
    res.render("login")
})

app.get('/auth/google',passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',  passport.authenticate('google', { failureRedirect: '/' , successRedirect:"/secrets" }));

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
});


app.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/')
    }                // this method is provided by Passport to remove the user from the session
)});




app.listen(process.env.PORT,()=>{
    console.log("listening at port 3000")
})