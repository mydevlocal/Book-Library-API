const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Category   = require('../models/category_model');

// == find all categories ==
router.get('/categories', isVerified, (req, res, next) => {
	Category
		.find({})
		.exec((err, results) => {
			if (err) {
				res.json({ success: false, message: 'Failed to show categories data, please try again.', results: err });
			} else {
				res.status(200).json({ success: true, message: 'All categories are available.', results: results });
			}
		});
});

// == find category by its id ==
router.get('/categories/:categoryid', isVerified, (req, res, next) => {
	const categoryid = req.params.categoryid;

	Category
		.findById({ '_id': req.params.categoryid })
		.exec((err, category) => {
			if (err) {
				res.json({ success: false, message: `Oops, a category with id: ${categoryid} cannot be found, please try again.`});
			} else {
				res.status(200).json({ success: true, message: `Category with id: ${categoryid} is found.`, results: category});
			}
		});
});

// == add new category
router.post('/categories', isVerified, (req, res, next) => {
	const category_name = req.body.category_name;

	let newUser = new Category();

	newUser.category_name = category_name;
	newUser.save((err, category) => {
		if (err) {
			res.json({ success: false, message: 'New category data cannot be save, please try again.', results: err });
		} else {
			res.status(201).json({ success: true, message: 'New category successfully saved.', results: category });
		}
	});
});

// == edit a spesific category ==
router.put('/categories/:categoryid', isVerified, (req, res, next) => {
	const categoryid    = req.params.categoryid;
	const category_name = req.body.category_name;
	const updatedAt     = Date.Now();

	let updatedCategory = new Category();

	updatedCategory.category_name = category_name;
	updatedCategory.updatedAt     = updatedAt;

	Category
		.findByIdAndUpdate(categoryid, updatedCategory, {})
		.exec((err, category) => {
			if (err) {
				res.json({ success: false, message: 'Failed to update the category data, please try again.', results: err });
			} else {
				res.json({ success: true, message: 'New category\'s data has been saved.', results: category });
			}
		});
});

// == delete a spesific category ==
router.delete('/categories/:categoryid', isVerified, (req, res, next) => {
	const categoryid = req.params.id;

	Category
		.findByIdAndRemove(categoryid)
		.exec((err, category) => {
			if (err) {
				res.json({ success: false, message: `A category with id: ${categoryid} cannot be found or delete, please try again.`});
			} else {
				res.status(204).json({ success: true, message: 'The category successfully deleted.' });
			}
		});
});

module.exports = router;