//First we need to learn in node how each js file can share the code from one file to another
//Example on execution: console.log("Execute instructions from router.js files")
//Example on exports: module.exports = "Export of the router.js file"
const express = require('express')
const router = express.Router()

//Use controller to get the js file to control interaction
const userController = require('./controllers/userController')

//To use the HTML template on ejs, use render and input the ejs file (not necessary with extension .ejs)
//Initially we use: function (req, res) {res.render('home-guest')}, now moved to controllers folder and call the userController.js
//Now we use controller to process the rendering, by calling the function and the method created

//Router to get user to homepage
router.get('/', userController.home)

//Router for user posting the registration
router.post('/register', userController.register)    
router.post('/login', userController.login)
router.post('/logout', userController.logout)
module.exports = router