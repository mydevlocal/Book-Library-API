const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Author     = require('../models/author_model');

// == find all authors ==
router.get('/authors', isVerified, (req, res, next) => {
	Author
		.find({})
		.exec((err, results) => {
			if (err) {
				res.json({ success: false, message: 'Failed to show authors data, please try again.', results: err });
			} else {
				res.status(200).json({ success: true, message: 'All authors are available.', results: results });
			}
		});
});

// == find aouthor by its id ==
router.get('/authors/:authorid', isVerified, (req, res, next) => {
	const authorid = req.params.authorid;

	Author
		.findById({ '_id': req.params.authorid })
		.exec((err, author) => {
			if (err) {
				res.json({ success: false, message: `Oops, an author with id: ${authorid} cannot be found, please try again.`});
			} else {
				res.status(200).json({ success: true, message: `Author with id: ${authorid} is found.`, results: author});
			}
		});
});

// == add new author
router.post('/authors', isVerified, (req, res, next) => {
	const fullname = req.body.fullname;
	const email    = req.body.email;

	let newAuthor = new Author();

	newAuthor.fullname = fullname;
	newAuthor.email    = email;
	newAuthor.save((err, author) => {
		if (err) {
			res.json({ success: false, message: 'New author data cannot be save, please try again.', results: err });
		} else {
			res.status(201).json({ success: true, message: 'New author successfully saved.', results: author });
		}
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

	Author
		.findByIdAndUpdate(authorid, updatedAuthor, { runValidators: true })
		.exec((err, author) => {
			if (err) {
				res.json({ success: false, message: 'Failed to update the author data, please try again.', results: err });
			} else {
				res.json({ success: true, message: 'New author\'s data has been saved.', results: updatedAuthor });
			}
		});
});

// == delete a spesific author ==
router.delete('/authors/:authorid', isVerified, (req, res, next) => {
	const authorid = req.params.authorid;

	Author
		.findByIdAndRemove({ '_id': authorid })
		.exec((err, author) => {
			if (err) {
				res.json({ success: false, message: `An author with id: ${authorid} cannot be found or delete, please try again.`});
			} else {
				res.status(204).json({ success: true, message: 'The author successfully deleted.' });
			}
		});
});

module.exports = router;