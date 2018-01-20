const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Author     = require('../models/author_model');

// == find all authors ==
router.get('/authors', isVerified, (req, res, next) => {
	let offset = req.query.offset ? parseInt(req.query.offset, 10) : null;
	let limit  = parseInt(req.query.limit);
	let total;

	if (offset !== null) {
		Author
			.count({})
			.then(count => {
				// intialize total authors
				total = count;

				// then return authors data
				return Author
								.find({})
								.sort({ fullname: 1 })
								.skip(offset)
								.limit(limit)
								.exec();
			})
			.then(results => {
				res.status(200).json({ success: true, message: 'All authors are available.', results: results, limit: limit, total: total });
			})
			.catch(err => {
				res.json({ success: false, message: 'Failed to show authors data, please try again.', results: err });
			});
	} else {
		// if there is no query string, get all authors 
		Author
			.find({})
			.then(results => {
				res.status(200).json({ success: true, message: 'All authors are available.', results: results });
			})
			.catch(err => {
				res.json({ success: false, message: 'Failed to show authors data, please try again.', results: err });
			});
	}
});

// == find author by id ==
router.get('/authors/:authorid', isVerified, (req, res, next) => {
	const authorid = req.params.authorid;

	// find author by the id of author
	Author
		.findById({ '_id': authorid })
		.then(author => {
			res.status(200).json({ success: true, message: `Author with id: ${authorid} is found.`, results: author});
		})
		.catch(err => {
			res.json({ success: false, message: `Oops, an author with id: ${authorid} cannot be found, please try again.`});
		});
});

// == add new author
router.post('/authors', isVerified, (req, res, next) => {
	const fullname = req.body.fullname;
	const email    = req.body.email;

	let newAuthor = new Author();

	newAuthor.fullname = fullname;
	newAuthor.email    = email;

	// insert new author to the database. No validation? soon :)
	// i can use client-side validation instead :D
	newAuthor
		.save()
		.then(author => {
			res.status(201).json({ success: true, message: 'New author successfully saved.', results: author });
		})
		.catch(err => {
			res.json({ success: false, message: 'New author data cannot be save, please try again.', results: err });
		});
});

// == edit a spesific author ==
router.put('/authors/:authorid', isVerified, (req, res, next) => {
	const authorid  = req.params.authorid;
	const fullname  = req.body.fullname;
	const email     = req.body.email;

	let updatedAuthor = new Author();

	updatedAuthor.fullname  = fullname;
	updatedAuthor.email     = email;
	updatedAuthor._id       = authorid;

	// To update the author, 'authorid' is absolutely required
	// and 'runValidators' will help to check the schema
	Author
		.findByIdAndUpdate(authorid, updatedAuthor, { runValidators: true })
		.then(updatedAuthor => {
			res.json({ success: true, message: 'New author\'s data has been saved.', results: updatedAuthor });
		})
		.catch(err => {
			res.json({ success: false, message: 'Failed to update the author data, please try again.', results: err });	
		});
});

// == delete a spesific author ==
router.delete('/authors/:authorid', isVerified, (req, res, next) => {
	const authorid = req.params.authorid;

	// nothing special here, just remove the existing document
	// by a spesific 'authorid'
	Author
		.findByIdAndRemove({ '_id': authorid })
		.then(author => {
			res.status(204).json({ success: true });
		})
		.catch(err => {
			res.json({ success: false, message: `An author with id: ${authorid} cannot be found or delete, please try again.`});
		});
});

module.exports = router;