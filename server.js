var http = require("http"),
    express = require("express"),
    app = express(),
    path = require("path"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Web3 = require("web3"),
    contract = require("truffle-contract"),
    commissionJSON = require("./build/contracts/Commission.json"),
    contract_id = require("./contract-config"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    User = require("./models/user");

mongoose.connect("mongodb://localhost/commission-io");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const Commission = contract(commissionJSON);

if (typeof web3 !== "undefined") {
    var web3 = new Web3(web3.currentProvider);
} else {
    var web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545")
    );
}

Commission.setProvider(web3.currentProvider);

var commission = Commission.at(contract_id.id);

// Passport Configuration
app.use(
    require("express-session")({
        secret: "very secure string",
        resave: false,
        saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    return next();
});

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/success", isLoggedIn, function(req, res) {
    res.render("success");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username,
        address: req.body.address
    });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/profile");
        });
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post(
    "/login",
    passport.authenticate(
        "local",

        {
            successRedirect: "/profile",
            failureRedirect: "/login"
        }
    ),
    function(req, res) {}
);

app.get("/profile", isLoggedIn, function(req, res) {
    res.render("profile", { currentAddress: req.user.address });
});

app.post("/profile", isLoggedIn, function(req, res) {
    let query = "address";
    User.findOne({ username: req.user.username }, function(err, user) {
        if (err) {
            console.log(err);
            return null;
        }
        user.address = req.body.address;
        user.save(function(err) {
            if (err) {
                console.log(err);
                return null;
            }
            res.redirect("/profile");
        });
    });
});

app.get("/connect", isLoggedIn, function(req, res) {
    res.render("connect");
});

app.post("/connect", isLoggedIn, function(req, res) {
    if (!sendEthers(req)) console.log("Destination null");
    res.redirect("/connect");
});

app.get("/logout", function(req, res) {
    req.logOut();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function sendEthers(req) {
    let wallet = req.user.address;
    let destination = findUserWallet(req.body.username);
    let amountToSend = req.body.amount;
    let nonce = web3.eth.getTransactionCount(wallet);
    if (destination == null) return false;
    commission
        .payArtist(destination, {
            from: wallet,
            value: amountToSend,
            gas: 21000
        })
        .then(function() {
            console.log("paid");
        })
        .catch(function(err) {
            console.log(err);
        });
    return true;
}

function findUserWallet(userQuery) {
    return User.findOne({ username: userQuery }, "address", function(
        err,
        user
    ) {
        if (err) return null;
        return user.address;
    });
}

var port = 8080;
app.listen(port, function() {
    console.log("Listening on port " + port);
});
