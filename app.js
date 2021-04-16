const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"))
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-sneha:Test123@cluster0.wycci.mongodb.net/bankingDB", {
        useUnifiedTopology: true ,
        useNewUrlParser: true,
        useFindAndModify: false});

const historySchema = mongoose.Schema({
    day: Number,
    month: Number,
    year: Number,
    hour: Number,
    minute: Number,
    From: String,
    To: String,
    status: String,
    amountExchange: Number
});

const History = mongoose.model("History", historySchema);

const userSchema = mongoose.Schema({
    name: String,
    gender: String,
    accountNumber: Number,
    balance: Number,
    phone: Number,
    email: String,
    address: String,
    history: [historySchema]
});

const User = mongoose.model("User", userSchema);

const defaultUserNames = ["Raktim Datta", "Aakash Das", "Arundhuti Dey", "Sayan Pal", "Sweta Ghosh", "Anirban Paul", "Ayan Das","Priya Roy","Pratim Kar","Raj Das"];
const defaultUsersEmail = ["raktim29@email.com", "aakash05@email.com", "adey20@email.com", "spal39@email.com", "sghosh78@email.com", "apaul18@email.com", "ad90@email.com","proy31@email.com","pkar25@email.com","rj69@email.com"];
const defaultUsersAddress = ["Behala, Kolkata", "NewMarket, Kolkata","Chetla, Kolkata", "Singipark, Dumdum", "Gandhi Road, Noida","Shiridi, Mumbai", "Bohrampur, Kolkata","Puri, Odissa","New Alipore, Kolkata","Mominpore, Kolkata"];

const defaultUsers = [];
for (let i = 0; i < defaultUserNames.length; i++) {
    if (defaultUserNames[i] === "Arundhuti Dey" || defaultUserNames[i] === "Sweta Ghosh" ||  defaultUserNames[i] === "Priya Roy") {
        const newUser = new User({
            name: defaultUserNames[i],
            gender: "Female",
            accountNumber: Math.floor(Math.random() * Math.pow(10, 11)),
            balance: (10000 + Math.floor(Math.random() * 10000)),
            phone: (6 * Math.pow(10, 9) + Math.floor(Math.random() * 3 * Math.pow(10, 9))),
            email: defaultUsersEmail[i],
            address: defaultUsersAddress[i],
        });
        defaultUsers.push(newUser);
    } else {
        const newUser = new User({
            name: defaultUserNames[i],
            gender: "Male",
            accountNumber: Math.floor(Math.random() * Math.pow(10, 11)),
            balance: (10000 + Math.floor(Math.random() * 10000)),
            phone: (6 * Math.pow(10, 9) + Math.floor(Math.random() * 3 * Math.pow(10, 9))),
            email: defaultUsersEmail[i],
            address: defaultUsersAddress[i],
        });
        defaultUsers.push(newUser);
    }

}


app.get("/", function (req, res) {
    User.find({}, function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers.length === 0) {
                User.insertMany(defaultUsers, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                })
                res.redirect("/");
            } else {
                const users = JSON.stringify(defaultUserNames);
                res.render("bank",{usersNames:users});
            }
        }
    });

});

app.get("/users", function (req, res) {
    User.find({}, function (err, foundUsers) {
        const users = JSON.stringify(defaultUserNames);
        res.render("users", {
            users: foundUsers,
            usersNames:users
        });
    });
});

app.get("/all-transections", function (req, res) {
    History.find({}, function (err, foundHistory) {
        const users = JSON.stringify(defaultUserNames);
        res.render("history", {
            history: foundHistory,
            usersNames:users
        });
    });
});

app.get("/invalid-search",function(req,res){
    const users = JSON.stringify(defaultUserNames);
    res.render("invalidSearch",{
        usersNames:users
    });
});

app.post("/searchUser",function(req,res){
    const searchedUser = req.body.user;
    User.find({name:searchedUser},function(err,foundUsers){

        if(foundUsers.length===0){

            res.redirect("/invalid-search");
        }
        else{
            res.redirect("/user-profile/"+searchedUser);
        }
    });
});

app.get("/other-details",function(req,res){
    const users = JSON.stringify(defaultUserNames);
    res.render("otherDetails",{
        usersNames:users
    });
});


app.post("/user", function (req, res) {
    const user = JSON.parse(req.body.user);
    res.redirect("/user-profile/"+user.name);
});

app.get("/user-profile/:userName",function(req,res){
    const userName = req.params.userName;
    const users = JSON.stringify(defaultUserNames);
    User.findOne({name:userName},function(err,foundUser){
        res.render("userProfile",{
            currentUser: foundUser,
            usersNames:users
        });
    });
});

app.post("/transferMoney", function (req, res) {
    const user = JSON.parse(req.body.user);
    res.redirect("/transferMoney-get/"+user.name);
});

app.get("/transferMoney-get/:userName",function(req,res){
    const userName = req.params.userName;
    const users = JSON.stringify(defaultUserNames);
    User.findOne({name:userName},function(err,foundUser){
        if(!err){
            res.render("transferMoney",{
                currentUserBalance : foundUser.balance,
                currentUserName : foundUser.name,
                users: defaultUserNames,
                usersNames:users
            });
        }
    });
});

app.get("/user-history-get/:userName",function(req,res){
    const userName = req.params.userName;
    const users = JSON.stringify(defaultUserNames);
    User.findOne({name:userName},function(err,foundUser){
        res.render("userHistory",{
            currentUser:foundUser,
            usersNames:users
        })
    });
});

app.post("/user-history", function (req, res) {
    const user = JSON.parse(req.body.user);
    res.redirect("/user-history-get/"+user.name);

});

app.post("/success", function (req, res) {
    const amount = Number(req.body.balance);
    const from = req.body.from;
    const to = req.body.to;

    User.findOne({
        name: from
    }, function (err, sender) {

        updateSenderBalace(sender.balance - amount);
    });

    function updateSenderBalace(newBalance) {
        const date = new Date();
        const newHistory = new History({
            day: date.getDate(),
            month: (date.getMonth() + 1),
            year: date.getFullYear(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            From: from,
            To: to,
            status: "negative",
            amountExchange: amount
        });
        newHistory.save();
        User.findOneAndUpdate({
            name: from
        }, {
            $set: {
                balance: newBalance
            },
            $push: {
                history: newHistory
            }
        }, {
            new: true
        }, function (err, sender) {

        });
    }

    User.findOne({
        name: to
    }, function (err, receiver) {

        updateReceiverBalance(receiver.balance + amount);
    });

    function updateReceiverBalance(newBalance) {
        const date = new Date();
        const newHistory = new History({
            day: date.getDate(),
            month: (date.getMonth() + 1),
            year: date.getFullYear(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            From: to,
            To: from,
            status: "positive",
            amountExchange: amount
        });
        User.findOneAndUpdate({
            name: to
        }, {
            $set: {
                balance: newBalance
            },
            $push: {
                history: newHistory
            }
        }, {
            new: true
        }, function (err, receiver) {

        });
    }

    User.findOne({
        name: from
    }, function (err, user) {
        const remainingAmount = user.balance - amount;
        res.redirect("/success-get/" + amount + "/" + to + "/" + remainingAmount);
    });

});

app.get("/success-get/:amount/:to/:remainingAmount", function (req, res) {
    const users = JSON.stringify(defaultUserNames);
    res.render("success", {
        user: req.user,
        balance: Number(req.params.amount),
        anotherPerson: req.params.to,
        remainingBalance: Number(req.params.remainingAmount),
        usersNames:users
    });
});


app.listen(3000, function(){
  console.log("Server has started on port 3000");
});
