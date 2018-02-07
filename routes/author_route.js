const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Author = require('../models/author_model');

// == find all authors ==
router.get('/authors', isVerified, async (req, res, next) => {
	/* eslint one-var: ["error", { var: "never" }] */
	const offset = req.query.offset ? parseInt(req.query.offset, 10) : null;
	const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
	let total,
		results;

	if (offset !== null) {
		try {
			// assigned total authors
			total = await Author.count({});
			// then return authors data
			results = await Author.find({}).sort({ fullname: 1 }).skip(offset).limit(limit);

			res.status(200).json({
				success: true, message: 'All authors are available.', results, limit, total,
			});
		} catch (err) {
			res.status(500).json({ success: false, message: 'Unknown server error when trying to find authors', error: err });
		}
	} else {
		try {
			// if there is no query string, get all authors
			results = await Author.find({});
			res.status(200).json({ success: true, message: 'All authors are available.', results });
		} catch (err) {
			res.status(500).json({ success: false, message: 'Unknown server error when trying to find authors', error: err });
		}
	}
});

// == find author by id ==
router.get('/authors/:authorid', isVerified, async (req, res, next) => {
	const { authorid } = req.params;
	let author;
	try {
		// find author by the id of author
		author = await Author.findById({ _id: authorid });
		res.status(200).json({ success: true, message: `Author with id: ${authorid} is found.`, results: author });
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to find an author with id: ${authorid}.`, error: err });
	}
});

// == add new author
router.post('/authors', isVerified, async (req, res, next) => {
	const { fullname } = req.body;
	const { email } = req.body;

	const author = new Author({
		fullname,
		email,
	});

	let newAuthor;
	try {
		// insert new author to the database. No validation? soon :)
		// i can use client-side validation instead :D
		newAuthor = await author.save();
		res.status(201).json({ success: true, message: 'New author successfully saved.', results: newAuthor });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Unknown server error when trying to save new author', error: err });
	}
});

// == edit a spesific author ==
router.put('/authors/:authorid', isVerified, async (req, res, next) => {
	const { authorid } = req.params;
	const { fullname } = req.body;
	const { email } = req.body;

	const updatedAuthor = new Author({
		fullname,
		email,
		_id: authorid,
	});

	let author;
	try {
		// To update the author, 'authorid' is absolutely required
		// and 'runValidators' will help to check the schema
		author = await Author.findByIdAndUpdate(authorid, updatedAuthor, { runValidators: true });

		if (!author) {
			res.status(404).json({ success: false, message: `An author with id: ${authorid} cannot be found.` });
		} else {
			res.status(200).json({ success: true, message: 'New author\'s data has been saved.', results: updatedAuthor });
		}
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to update an author with id: ${authorid}.`, error: err });
	}
});

// == delete a spesific author ==
router.delete('/authors/:authorid', isVerified, async (req, res, next) => {
	const { authorid } = req.params;
	let author;
	try {
		// nothing special here, just remove the existing document
		// by a spesific 'authorid'
		author = await Author.findByIdAndRemove({ _id: authorid });

		if (!author) {
			res.status(404).json({ success: false, message: `An author with id: ${authorid} cannot be found.` });
		} else {
			res.status(204).json({ success: true });
		}
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to delete an author with id: ${authorid}.`, error: err });
	}
});

module.exports = router;
