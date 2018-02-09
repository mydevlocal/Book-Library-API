const express = require('express');

const router = express.Router();

const isVerified = require('../config/token_verification').TokenVerification;
const Category = require('../models/category_model');

// == find all categories ==
router.get('/categories', isVerified, async (req, res, next) => {
	let categories;
	try {
		categories = await Category.find({});
		res.status(200).json({ success: true, message: 'All categories are available.', results: categories });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Unknown server error when trying to find categories', error: err });
	}
});

// == find category by id ==
router.get('/categories/:categoryid', isVerified, async (req, res, next) => {
	const { categoryid } = req.params;
	let category;
	try {
		// find category by the id of category
		category = await Category.findById({ _id: categoryid });
		res.status(200).json({ success: true, message: `Category with id: ${categoryid} is found.`, results: category });
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to find a category with id: ${categoryid}.`, error: err });
	}
});

// == add new category
router.post('/categories', isVerified, async (req, res, next) => {
	const categoryName = req.body.category_name;

	const category = new Category({
		category_name: categoryName,
	});

	let newCategory;
	try {
		// insert new category to the database. No validation? soon :)
		// i can use client-side validation instead :D
		newCategory = await category.save();
		res.status(201).json({ success: true, message: 'New category successfully saved.', results: newCategory });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Unknown server error when trying to save new category', error: err });
	}
});

// == edit a spesific category ==
router.put('/categories/:categoryid', isVerified, async (req, res, next) => {
	const { categoryid } = req.params;
	const categoryName = req.body.category_name;

	const updatedCategory = new Category({
		category_name: categoryName,
		_id: categoryid,
	});

	let category;
	try {
		// To update the category, 'categoryid' is absolutely required
		// and 'runValidators' will help to check the schema
		category = await Category.findByIdAndUpdate(categoryid, updatedCategory, { runValidators: true });

		if (!category) {
			/* eslint max-len: ["error", { "code": 150 }] */
			res.status(404).json({ success: false, message: `A category with id: ${categoryid} cannot be found.` });
		} else {
			res.status(200).json({ success: true, message: 'New category data has been saved.', results: updatedCategory });
		}
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to update category with id: ${categoryid}.`, error: err });
	}
});

// == delete a spesific category ==
router.delete('/categories/:categoryid', isVerified, async (req, res, next) => {
	const { categoryid } = req.params;
	let category;
	try {
		// nothing special here, just remove the existing document
		// by a specific 'categoryid'
		category = await Category.findByIdAndRemove({ _id: categoryid });

		if (!category) {
			res.status(404).json({ success: false, message: `A category with id: ${categoryid} cannot be found.` });
		} else {
			res.status(204).json({ success: true });
		}
	} catch (err) {
		res.status(500).json({ success: false, message: `Unknown server error when trying to delete category with id: ${categoryid}.`, error: err });
	}
});

module.exports = router;
