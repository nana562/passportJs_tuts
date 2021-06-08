const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require('passport')

//User model
const User = require("../models/User");

//Login Page
router.get("/login", (req, res) => res.render("login"));

router.get("/register", (req, res) => res.render("register"));

//Register Handle
router.post("/register", (req, res) => {
  const {
    name, email, password, password2
  }=req.body;

  let errors = [];
  
//Check required fields
  if(!name || !email || !password || !password2){
      errors.push({msg: "Please fill in all fields"});
      res.json(errors)
  }
  if(errors.length > 0){
      res.render('register', {
          errors,
          name,
          email, 
          password,
          password2
      });
  } 
  else{
    User.findOne({email: email})
    .then(user =>{
        if(user){
            errors.push({msg: 'Email is already registered'})
            res.json('User exists')
        }
        else{
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            });
        
           //Hash Password
           bcrypt.genSalt(10, (error, salt)=>
            bcrypt.hash(newUser.password, salt, (err,hash)=>{
             if(err) throw err;
//Set password to hashed
            newUser.password = hash;
            newUser.save()
                .then(user=>{
                    req.flash('success_msg', 'You are now registered')
                   // res.json(user)
                    res.redirect('/users/login')
                })
           }))
        }
    });
  }
});
//Login Handle
router.post('/login',(req, res, next)=>{
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout Handle
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/users/login')
})

module.exports = router;
