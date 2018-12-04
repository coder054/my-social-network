const router = require("express").Router()
const User = require("../models/user")
const passportConfig = require("../config/passport")

const passport = require("passport")

router
  .route("/signup")
  .get((req, res, next) => {
    res.render("accounts/signup", { message: req.flash("errors") })
  })
  .post(async (req, res, next) => {
    try {
      let result = await User.findOne({ email: req.body.email })
      if (result) {
        req.flash("errors", "Acount with that email already exist")
        res.redirect("/signup")
      } else {
        var user = new User()
        user.name = req.body.name
        user.email = req.body.email
        user.photo = user.gravatar()
        user.password = req.body.password
        let saveUserResult = await user.save()
        req.logIn(user, function(err) {
          if (err) return next(err)
          res.redirect("/")
        })
        res.redirect("/")
      }
    } catch (error) {
      next(error)
    }
  })

router
  .route("/login")
  .get((req, res, next) => {
    if (req.user) res.redirect("/")

    res.render("accounts/login", { message: req.flash("loginMessage") })
  })
  .post(
    passport.authenticate("local-login", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true
    })
  )

router.get("/logout", (req, res, next) => {
  req.logout()
  res.redirect("/")
})

router.get("/all-users", async (req, res, next) => {
  var keyword = req.query.keyword || ""
  // console.log("keyword", keyword)
  let users
  if (!keyword) {
    // if not searching, return all cars
    users = await User.find({})
  } else {
    // if user is searching, return cars that match with keyword
    users = await User.find({ $text: { $search: keyword } })
  }

  // // console.log("users", users)
  let nouser = true
  if (users && users.length >= 1) {
    nouser = false
  }

  res.render("main/allUsers", { users, keyword, nouser })
})

module.exports = router
