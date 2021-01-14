//Export multiple function that can be accessed from another file
/* Below method is valid for exports, but it might be a lot messier to read.
module.exports = {
    login = function() {},
    logout = function() {}
}
so we will use custom object and custom function to make the code cleaner
*/
//.login below is a custom object
// "../" to move up 1 folder out of controller folder, move into "models" folder and select "User.js"
const User = require('../models/User')

exports.login = function(req, res) {
    //For testing: console.log(req.body), result is object: [{username: , password:}]
    let user = new User(req.body)
    //function() inside the 'mtdLogin' used as argument that will be passed to 'login' function
    //This code using promise approach, so after mrdLogin(), we add then() for if promise succeed, and add catch() for when promise failed
    user.mtdLogin().then(function(resultSuccess) {
        //userVisit is new custom variable, to differentiate with 'user' that created earlier
        //The idea is now req have unique session per visitor
        //The "session" will create new data in mongodb under session collection. And it is asynchronous task that takes several time to complete.
        req.session.userVisit = {username: user.data.username}
        //for test: res.send(resultSuccess)
        //To ensure responded page loaded _after_ data create complete, we use manual 'save' method for session.
        //Function inside "save" will run only after the session saved properly.
        req.session.save(function() {
            res.redirect('/')
        })
    }).catch(function(resultFailure) {
        //for test: res.send(resultFailure)
        //after installing connect-flash, we can use flash method. Contains 2 argument: (1). name of flash object we want to build/add onto, (2). the message
        //in this flash, in (2) we can say "incorrect password", but since we use method: mtdLogin() which will return reject / resolve, we will use it as input in function
        //so 'resultFailure' will store any reject / resolve from mtdLogin(), and put as flash message (2)
        //also same as : req.sesson.flash.errors = [resultFailure]
        req.flash('errors', resultFailure)
        req.session.save(function() {
            res.redirect('/')
        })
    })
}

exports.logout = function(req, res) {
    req.session.destroy(function() {
        res.redirect('/')
    })
    //for test: res.send("You are now logged out")
}

//Catching router "/register"
exports.register = function(req, res) {
    //for testing: console.log(req.body), result is object: [{username: , email: , password:}]
    //operator : "new" create plain new object using "blueprint" function User()
    //Blueprint get uppercase as programmer convention to differentiate object created ("let user") and the blueprint ("User")
    let user = new User(req.body) //Add body of form to be submitted
    user.mtdRegister().then(() => {
        //Initially only display congrats on success, now followed up with redirect to next page
        req.session.user = {username: user.data.username}
        req.session.save(function() {
            res.redirect('/')
        })
    }).catch((regErrors) => {
        //for test: res.send(user.errors)
        regErrors.forEach(function(registerError) {
            req.flash('regErrors', registerError)
        })
        req.session.save(function() {
            res.redirect('/')
        })
    })
}

exports.home = function(req, res) {
    //If user login, shows home for user, else shows home for guest
    //To use the HTML template on ejs, use render and input the ejs file (not necessary with extension .ejs)
    if (req.session.userVisit) {
        //to test, use: res.send("Welcome to the actual application") 
        res.render('home-dashboard', {viewUserName: req.session.userVisit.username})
    } else {
        //We can manually access: req.session.flash.errors, but we not only need to access the database session,
        //but also delete it once displayed to user, since we only need to show error once, so we use "flash" method
        res.render('home-guest', {viewErrors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }
}