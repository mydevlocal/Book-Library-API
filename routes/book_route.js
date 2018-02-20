const express = require('express');

const router = express.Router();

const isVerified = require('../utils/token_verification').TokenVerification;
const Book = require('../models/book_model');

// == find all books ==
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
	}
});

// == no token required for display, synopsis & populer route ==
// == display all books in homepage ==
router.get('/books/display', async (req, res, next) => {
	/* eslint one-var: ["error", { var: "never" }] */
	const offset = req.query.offset ? parseInt(req.query.offset, 10) : null;
	const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
	let total,
		results;

	try {
		total = await Book.count({});
		results = await Book.find({}).sort({ title: 1 })
			.populate('author').populate('category')
			.skip(offset)
			.limit(limit);

		res.status(200).json({
			success: true, message: 'All books are available.', results, limit, total,
		});
	} catch (err) {
		res.status(500).json({ success: false, message: 'Unknown server error when trying to fetching all book data', error: err });
	}
});

// == find book by title in homepage ==
router.get('/books/display/:title', async (req, res, next) => {
	const { title } = req.params;
	let book;
	try {
		// query like case-insensitive with regex
		book = await Book.find({ title: { $regex: title, $options: 'i' } }).populate('author').populate('category');
		res.status(200).json({ success: true, message: `Book with title: ${title} is found.`, results: book });
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to find a book with title: ${title}.`, error: err });
	}
});

// == list populer books by stars ==
router.get('/books/populer', async (req, res, next) => {
	let results;
	try {
		results = await Book.find({}).sort({ title: 1 }).select('_id title').limit(7);

		res.status(200).json({ success: true, message: 'Ready to list the populer books', results });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Unknown server error when trying to fetching all book data', error: err });
	}
});

// == show a book synopsis ==
router.get('/books/synopsis/:bookid', async (req, res, next) => {
	const { bookid } = req.params;
	let book;
	try {
		book = await Book.findById({ _id: bookid });
		res.status(200).json({ success: true, message: `Book with id: ${bookid} is found.`, results: book });
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to find a book with id: ${bookid}.`, error: err });
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
