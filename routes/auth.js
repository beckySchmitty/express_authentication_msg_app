const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

router.get('/hi', (req, res, next) => {
    res.send("APP IS WORKING!!!")
  })

/** POST /login - login: {username, password} => {token} **/
router.post('/login', async (req, res, next) => {
  try {
    let {username, password} = req.body;
    if(await User.authenticate(username, password)) {
      const token = jwt.sign({username}, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({token})
    } else 
      throw new ExpressError("Invalid username/passwrd", 400);
  } catch(e) {
    return next(e)
  }
})


/** POST /register - register user: registers, logs in, and returns token.
 *{username, password, first_name, last_name, phone} => {token}.*/
router.post('/register', async (req, res, next) => {
  try {
    let {username, password, first_name, last_name, phone} = req.body;
    const user = await User.register({username, password, first_name, last_name, phone})

    if(user) {
      const token = jwt.sign({username}, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({token})
    } else {
      throw new ExpressError("Error: user not created", 400)
    }
  } catch(e) {
    return next(e)
  }
})
 module.exports = router;