const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    const preexistingUsernames = users.filter((user) => {
        return user.username === username;
    }) 

    return preexistingUsernames.length > 0;
}

const authenticated = (username, password) => {
    let validUsers = users.filter((user) => {
        return user.username === username && user.password === password;
    })

    return validUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password)
        res.status(404).json("Error logging in")

    if(authenticated(username, password))
    {
        let accessToken = jwt.sign(
            { data: password },
            'access', 
            { expiresIn: 60 * 60 } 
        );
        
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let user = req.session.authorization.username;
    let isbn = req.params.isbn;

    // check if the provided ISBN is valid
    if(!books[isbn])
        return res.status(403).json("invalid ISBN")

    let book = books[isbn];
    let review = req.body.review;

    book.reviews[user] = { "says" : review };

    res.send("Review of " + book.title + " from " + user + " added successfully!\n" + JSON.stringify(book, null, 4));
    
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let user = req.session.authorization.username;
    let isbn = req.params.isbn;

    // check if the provided ISBN is valid
    if(!books[isbn])
        return res.status(403).json("invalid ISBN")

    let book = books[isbn];

    if(!book.reviews[user])
        return res.status(403).json("You have no reviews of this book")
    
    book.reviews[user] = { };
    res.send("Review of " + book.title + " from " + user + " deleted successfully!\n" + JSON.stringify(book, null, 4));
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
