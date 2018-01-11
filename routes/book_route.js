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
		.exec((err, results) => {
			if (err) {
				res.json({ success: false, message: 'Failed to show books data, please try again.', results: err });
			} else {
				res.status(200).json({ success: true, message: 'All books are available.', results: results });
			}
		});
});

// == find book by its id ==
router.get('/books/:bookid', isVerified, (req, res, next) => {
	const bookid = req.params.bookid;

	Book
		.findById({ '_id': req.params.bookid })
		.populate('author')
		.populate('category')
		.exec((err, book) => {
			if (err) {
				res.json({ success: false, message: `Oops, a book with id: ${bookid} cannot be found, please try again.`});
			} else {
				res.status(200).json({ success: true, message: `Book with id: ${bookid} is found.`, results: book});
			}
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
	newBook.save((err, book) => {
		if (err) {
			res.json({ success: false, message: 'New book data cannot be save, please try again.', results: err });
		} else {
			res.status(201).json({ success: true, message: 'New book successfully saved.', results: book });
		}
	});
});

// == edit a spesific book ==
router.put('/books/:bookid', isVerified, (req, res, next) => {
	const bookid    = req.params.bookid;
	const book_name = req.body.book_name;
	const updatedAt     = Date.Now();

	let updatedBook = new Book();

	updatedBook.book_name = book_name;
	updatedBook.updatedAt     = updatedAt;

	Book
		.findByIdAndUpdate(bookid, updatedBook, {})
		.exec((err, book) => {
			if (err) {
				res.json({ success: false, message: 'Failed to update the book data, please try again.', results: err });
			} else {
				res.json({ success: true, message: 'New book\'s data has been saved.', results: book });
			}
		});
});

// == delete a spesific book ==
router.delete('/books/:bookid', isVerified, (req, res, next) => {
	const bookid = req.params.id;

	Book
		.findByIdAndRemove(bookid)
		.exec((err, book) => {
			if (err) {
				res.json({ success: false, message: `A book with id: ${bookid} cannot be found or delete, please try again.`});
			} else {
				res.status(204).json({ success: true, message: 'The book successfully deleted.' });
			}
		});
});

module.exports = router;