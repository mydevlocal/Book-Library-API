const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Book = require('../models/book_model');

// == find all books ==
router.get('/books', isVerified, (req, res, next) => {
	const offset = req.query.offset ? parseInt(req.query.offset, 10) : null;
	const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
	let total;

	if (offset !== null) {
		Book
			.count({})
			.then((count) => {
				// initialize total books
				total = count;

				// then return books data
				return Book
					.find({})
					.sort({ title: 1 })
					.populate('author')
					.populate('category')
					.skip(offset)
					.limit(limit)
					.exec();
			})
			.then((results) => {
				res.status(200).json({
					success: true, message: 'All books are available.', results, limit, total,
				});
			})
			.catch((err) => {
				res.json({ success: false, message: 'Failed to show books data, please try again.', results: err });
			});
	} else {
		// if there is no query string, get all books
		Book
			.find({})
			.populate('author')
			.populate('category')
			.then((results) => {
				res.status(200).json({ success: true, message: 'All books are available.', results });
			})
			.catch((err) => {
				res.json({ success: false, message: 'Failed to show books data, please try again.', results: err });
			});
	}
});

// == find book by id ==
router.get('/books/:bookid', isVerified, (req, res, next) => {
	const { bookid } = req.params;

	// find book by the id of book and
	// populate the author & category of the book
	Book
		.findById({ _id: bookid })
		.populate('author')
		.populate('category')
		.then((book) => {
			res.status(200).json({ success: true, message: `Book with id: ${bookid} is found.`, results: book });
		})
		.catch((err) => {
			res.json({ success: false, message: `Oops, a book with id: ${bookid} cannot be found, please try again.`, error: err });
		});
});

// == add new book
router.post('/books', isVerified, (req, res, next) => {
	const { title } = req.body;
	const { category } = req.body;
	const { pages } = req.body;
	const { author } = req.body;
	const { published } = req.body;

	const newBook = new Book();

	newBook.title = title;
	newBook.category = category;
	newBook.pages = pages;
	newBook.author = author;
	newBook.published = published;

	// insert new book to the database, author & category field is
	// bounded to their schema objectid
	newBook
		.save()
		.then((book) => {
			res.status(201).json({ success: true, message: 'New book successfully saved.', results: book });
		})
		.catch((err) => {
			res.json({ success: false, message: 'New book data cannot be save, please try again.', results: err });
		});
});

// == edit a spesific book ==
router.put('/books/:bookid', isVerified, (req, res, next) => {
	const { bookid } = req.params;
	const { title } = req.body;
	const { category } = req.body;
	const { pages } = req.body;
	const { author } = req.body;
	const { published } = req.body;

	const updatedBook = new Book();

	updatedBook.title = title;
	updatedBook.category = category;
	updatedBook.pages = pages;
	updatedBook.author = author;
	updatedBook.published = published;
	updatedBook._id = bookid; /* eslint no-underscore-dangle: 0 */

	// To update the book, 'bookid' is absolutely required
	// and 'runValidators' will help to check the schema
	Book
		.findByIdAndUpdate(bookid, updatedBook, { runValidators: true })
		.then(() => {
			res.json({ success: true, message: 'New book\'s data has been saved.', results: updatedBook });
		})
		.catch((err) => {
			res.json({ success: false, message: 'Failed to update the book data, please try again.', results: err });
		});
});

// == delete a spesific book ==
router.delete('/books/:bookid', isVerified, (req, res, next) => {
	const { bookid } = req.params;

	// nothing spesific here, just remove the existing document
	// by a speficic 'bookid'
	Book
		.findByIdAndRemove({ _id: bookid })
		.then(() => {
			res.status(204).json({ success: true });
		})
		.catch((err) => {
			res.json({ success: false, message: `A book with id: ${bookid} cannot be found or delete, please try again.`, error: err });
		});
});

module.exports = router;
