const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password)
    {
        if(!isValid(username))
        {
            users.push({"username": username, "password": password});
            res.status(200).json("Username and password registered successfully");
        }
        else {
            res.status(404).json("User with the username " + username + " already exists");
        }
    }
    else {
        res.status(404).json("Username and/or password was not provided. Please provide both a username and a password to register")
    }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {

    let bookList = new Promise((resolve, reject) => {
        try {
            let data = books;
            resolve(data);
        } catch {
            reject();
        }
    })

    bookList.then(
        (data) => res.send(JSON.stringify(data, null, 4)),

        () => res.status(403).json("Could not find the book list")
    );

    return bookList;

});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    let isbn = req.params.isbn;

    let book = new Promise((resolve, reject) => {
        try {
            if(books[isbn])
            {
                let data = books[isbn];
                resolve(data);
            }
            else {
                let error = {
                    "statusCode":403,
                    "message":"Invalid ISBN Provided"
                }
                reject(error);
            }
        } catch {
            let error = {
                "statusCode":500,
                "message":"Could not conect to server"}
            reject(error);
        }
    })

    book.then(
        (data) => res.send(JSON.stringify(data, null, 4)),
        (error) => res.status(error.statusCode).json(error.message)
    );

    return book;
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let booksByAuthor = new Promise((resolve, reject) => {
        try {
            let author = req.params.author;
            let bookDetails = [];
            let bookKeys = Object.keys(books);

            bookKeys.forEach(key => {
                if (books[key].author === author)
                {
                    bookDetails.push(books[key]);
                }
            });
            
            if(bookDetails.length > 0)
            {
                resolve(bookDetails);
            } else {
                let error = {
                    "statusCode":403,
                    "message":"Provided author not found"
                }
                reject(error);
            }
        } catch {
            let error = {
                "statusCode":500,
                "message":"Could not conect to server"}
            reject(error);
        }
    })

    booksByAuthor.then(
        (data) => res.send(JSON.stringify(data, null, 4)),
        (error) => res.status(error.statusCode).json(error.message)
    );

    return booksByAuthor;
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let booksByTitle = new Promise((resolve, reject) => {
        try {
            let title = req.params.title;
            let bookDetails = [];
            let bookKeys = Object.keys(books);

            bookKeys.forEach(key => {
                if (books[key].title === title)
                {
                    bookDetails.push(books[key]);
                }
            });
            
            if(bookDetails.length > 0)
            {
                resolve(bookDetails);
            } else {
                let error = {
                    "statusCode":403,
                    "message":"Book(s) with provided title not found"
                }
                reject(error);
            }
        } catch {
            let error = {
                "statusCode":500,
                "message":"Could not conect to server"}
            reject(error);
        }
    })

    booksByTitle.then(
        (data) => res.send(JSON.stringify(data, null, 4)),
        (error) => res.status(error.statusCode).json(error.message)
    );

    return booksByTitle;
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn

    if(books[isbn])
        res.send(books[isbn].reviews)
    else
        res.status(403).json("invalid ISBN")
});

module.exports.general = public_users;
