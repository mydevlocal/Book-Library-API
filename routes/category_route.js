const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Category   = require('../models/category_model');

// == find all categories ==
router.get('/categories', isVerified, (req, res, next) => {
	Category
		.find({})
		.then(results => {
			res.status(200).json({ success: true, message: 'All categories are available.', results: results });
		})
		.catch(err => {
			res.json({ success: false, message: 'Failed to show categories data, please try again.', results: err });
		});
});

// == find category by id ==
router.get('/categories/:categoryid', isVerified, (req, res, next) => {
	const categoryid = req.params.categoryid;

	// find category by the id of category
	Category
		.findById({ '_id': categoryid })
		.then(category => {
			res.status(200).json({ success: true, message: `Category with id: ${categoryid} is found.`, results: category});
		})
		.catch(err => {
			res.json({ success: false, message: `Oops, a category with id: ${categoryid} cannot be found, please try again.`});
		});
});

// == add new category
router.post('/categories', isVerified, (req, res, next) => {
	const category_name = req.body.category_name;

	let newCategory = new Category();

	newCategory.category_name = category_name;

	// insert new category to the database. No validation? soon :)
	// i can use client-side validation instead :D
	newCategory
		.save()
		.then(category => {
			res.status(201).json({ success: true, message: 'New category successfully saved.', results: category });
		})
		.catch(err => {
			res.json({ success: false, message: 'New category data cannot be save, please try again.', results: err });
		});
});

// == edit a spesific category ==
router.put('/categories/:categoryid', isVerified, (req, res, next) => {
	const categoryid    = req.params.categoryid;
	const category_name = req.body.category_name;

	let updatedCategory = new Category();

	updatedCategory.category_name = category_name;
	updatedCategory._id           = categoryid;

	// To update the category, 'categoryid' is absolutely required
	// and 'runValidators' will help to check the schema
	Category
		.findByIdAndUpdate(categoryid, updatedCategory, { runValidators: true })
		.then(updatedCategory => {
			res.json({ success: true, message: 'New category data has been saved.', results: updatedCategory });
		})
		.catch(err => {
			res.json({ success: false, message: 'Failed to update the category data, please try again.', results: err });
		});
});

// == delete a spesific category ==
router.delete('/categories/:categoryid', isVerified, (req, res, next) => {
	const categoryid = req.params.categoryid;

	// nothing special here, just remove the existing document
	// by a specific 'categoryid'
	Category
		.findByIdAndRemove({ '_id': categoryid })
		.then(category => {
			res.status(204).json({ success: true });
		})
		.catch(err => {
			res.json({ success: false, message: `A category with id: ${categoryid} cannot be found or delete, please try again.`});
		});
});

module.exports = router;