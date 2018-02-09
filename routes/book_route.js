const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Book = require('../models/book_model');

// == find all books ==
<<<<<<< HEAD
router.get('/books', isVerified, (req, res, next) => {
	let offset = req.query.offset ? parseInt(req.query.offset, 10) : null;
	let limit  = req.query.limit ? parseInt(req.query.limit, 10) : null;
	let total;

	if (offset !== null) {
		Book
			.count({})
			.then(count => {
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
			.then(results => {
				res.status(200).json({ success: true, message: 'All books are available.', results: results, limit: limit, total: total });
			})
			.catch(err => {
				res.json({ success: false, message: 'Failed to show books data, please try again.', results: err });				
			})
	} else {
		// if there is no query string, get all books
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
=======
router.get('/books', isVerified, async (req, res, next) => {
	/* eslint one-var: ["error", { var: "never" }] */
	const offset = req.query.offset ? parseInt(req.query.offset, 10) : null;
	const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
	let total,
		results;

	if (offset !== null) {
		try {
			// initialize total books
			total = await Book.count({});
			// then return books data
			results = await Book.find({}).sort({ title: 1 })
				.populate('author').populate('category')
				.skip(offset)
				.limit(limit);

			res.status(200).json({
				success: true, message: 'All books are available.', results, limit, total,
			});
		} catch (err) {
			res.status(500).json({ success: false, message: 'Unknown server error when trying to find books', error: err });
		}
	} else {
		try {
			// if there is no query string, get all books
			results = await Book.find({}).populate('author').populate('category');
			res.status(200).json({ success: true, message: 'All books are available.', results });
		} catch (err) {
			res.status(500).json({ success: false, message: 'Unknown server error when trying to find books', error: err });
		}
>>>>>>> master
	}
});

// == find book by id ==
router.get('/books/:bookid', isVerified, async (req, res, next) => {
	const { bookid } = req.params;
	let book;
	try {
		// find book by the id of book and
		// populate the author & category of the book
		book = await Book.findById({ _id: bookid }).populate('author').populate('category');
		res.status(200).json({ success: true, message: `Book with id: ${bookid} is found.`, results: book });
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to find a book with id: ${bookid}.`, error: err });
	}
});

// == add new book
router.post('/books', isVerified, async (req, res, next) => {
	const { title } = req.body;
	const { category } = req.body;
	const { pages } = req.body;
	const { author } = req.body;
	const { published } = req.body;

	const book = new Book({
		title,
		category,
		pages,
		author,
		published,
	});

	let newBook;
	try {
		// insert new book to the database, author & category field is
		// bounded to their schema objectid
		newBook = await book.save();
		res.status(201).json({ success: true, message: 'New book successfully saved.', results: newBook });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Unknown server error when trying to save new book.', results: err });
	}
});

// == edit a spesific book ==
router.put('/books/:bookid', isVerified, async (req, res, next) => {
	const { bookid } = req.params;
	const { title } = req.body;
	const { category } = req.body;
	const { pages } = req.body;
	const { author } = req.body;
	const { published } = req.body;

	const updatedBook = new Book({
		title,
		category,
		pages,
		author,
		published,
		_id: bookid,
	});

	let book;
	try {
		// To update the book, 'bookid' is absolutely required
		// and 'runValidators' will help to check the schema
		book = await Book.findByIdAndUpdate(bookid, updatedBook, { runValidators: true });

		if (!book) {
			res.status(404).json({ success: false, message: `A book with id: ${bookid} cannot be found.` });
		} else {
			res.status(200).json({ success: true, message: 'New book\'s data has been saved.', results: updatedBook });
		}
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to update a book with id: ${bookid}.`, error: err });
	}
});

// == delete a spesific book ==
router.delete('/books/:bookid', isVerified, async (req, res, next) => {
	const { bookid } = req.params;
	let book;
	try {
		// nothing spesific here, just remove the existing document
		// by a speficic 'bookid'
		book = await Book.findByIdAndRemove({ _id: bookid });

		if (!book) {
			res.status(404).json({ success: false, message: `A book with id: ${bookid} cannot be found.` });
		} else {
			res.status(204).json({ success: true });
		}
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to delete a book with id: ${bookid}.`, error: err });
	}
});

module.exports = router;
