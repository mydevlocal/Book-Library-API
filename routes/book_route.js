const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Book       = require('../models/book_model');
const Author     = require('../models/author_model');
const Category   = require('../models/category_model');

// == find all books ==
router.get('/books', isVerified, (req, res, next) => {
	Book
		.find({})
		.populate('author')
		.populate('category')
		.then(results => {
			res.status(200).json({ success: true, message: 'All books are available.', results: results });
		})
		.catch(err => {
			res.json({ success: false, message: 'Failed to show books data, please try again.', results: err });
		});
});

// == find book by id ==
router.get('/books/:bookid', isVerified, (req, res, next) => {
	const bookid = req.params.bookid;

	// find book by the id of book and 
	// populate the author & category of the book
	Book
		.findById({ '_id': bookid })
		.populate('author')
		.populate('category')
		.then(book => {
			res.status(200).json({ success: true, message: `Book with id: ${bookid} is found.`, results: book });
		})
		.catch(err => {
			res.json({ success: false, message: `Oops, a book with id: ${bookid} cannot be found, please try again.`});
		});
});

// == add new book
router.post('/books', isVerified, (req, res, next) => {
	const title     = req.body.title;
	const category  = req.body.category;
	const pages     = req.body.pages;
	const author    = req.body.author;
	const published = req.body.published;

	let newBook = new Book();

	newBook.title     = title;
	newBook.category  = category;
	newBook.pages     = pages;
	newBook.author    = author;
	newBook.published = published;

	// insert new book to the database, author & category field is
	// bounded to their schema objectid
	newBook
		.save()
		.then(book => {
			res.status(201).json({ success: true, message: 'New book successfully saved.', results: book });
		})
		.catch(err => {
			res.json({ success: false, message: 'New book data cannot be save, please try again.', results: err });
		});
});

// == edit a spesific book ==
router.put('/books/:bookid', isVerified, (req, res, next) => {
	const bookid    = req.params.bookid;
	const title     = req.body.title;
	const category  = req.body.category;
	const pages     = req.body.pages;
	const author    = req.body.author;
	const published = req.body.published;

	let updatedBook = new Book();

	updatedBook.title     = title;
	updatedBook.category  = category;
	updatedBook.pages     = pages;
	updatedBook.author    = author;
	updatedBook.published = published;
	updatedBook._id       = bookid;

	// To update the book, 'bookid' is absolutely required
	// and 'runValidators' will help to check the schema
	Book
		.findByIdAndUpdate(bookid, updatedBook, { runValidators: true })
		.then(updatedBook => {
			res.json({ success: true, message: 'New book\'s data has been saved.', results: updatedBook });
		})
		.catch(err => {
			res.json({ success: false, message: 'Failed to update the book data, please try again.', results: err });
		});
});

// == delete a spesific book ==
router.delete('/books/:bookid', isVerified, (req, res, next) => {
	const bookid = req.params.bookid;

	// nothing spesific here, just remove the existing document
	// by a speficic 'bookid'
	Book
		.findByIdAndRemove({ '_id': bookid })
		.then(book => {
			res.status(204).json({ success: true });
		})
		.catch(err => {
			res.json({ success: false, message: `A book with id: ${bookid} cannot be found or delete, please try again.`});
		});
});

module.exports = router;