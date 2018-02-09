const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user_model');
const opts = require('../config/options');

// == signup a user to get a speficic token ==
router.post('/signup', async (req, res, next) => {
	const { username } = req.body;
	const { password } = req.body;

	let user;
	try {
		user = await User.findOne({ username });

		// if user found return immediately, else create a new user
		if (user) {
			res.json({ success: false, message: 'Username is already taken' });
		} else {
			const createUser = new User({
				username,
				password, // encrypted inside pre hook
			});

			try {
				// insert new user to database
				await createUser.save();
				res.status(201).json({ success: true, message: 'Successful create a new user.' });
			} catch (err) {
				res.status(500).json({ success: false, message: 'Unable to create new user.', error: err });
			}
		}
	} catch (err) {
		res.status(500).json({ success: false, message: 'Cannot proceed your registration data, please try again.', error: err });
	}
});

// == signin to get a token to use the api ==
router.post('/signin', async (req, res, next) => {
	/* eslint one-var: ["error", { var: "never" }] */
	const { username } = req.body;
	const { password } = req.body;

	let user;

	try {
		user = await User.findOne({ username });

		user.comparePassword(password, (err, isMatch) => {
			if (!isMatch) res.status(401).json({ success: false, message: 'Password didn\'t match.' });
			/* eslint no-underscore-dangle: 0 */
			// everything passed, set user id as payload
			const payload = { id: user._id };

			// sign the token, make it to expiresIn 3 days
			jwt.sign(payload, opts.jwtSecret.tokenKey, { expiresIn: '3d' }, (error, token) => {
				if (error) {
					res.status(401).json({ success: false, message: 'Cannot proceed the signature, please try again', error });
				} else {
					res.json({ success: true, message: 'Login success, get your token', token });
				}
			});
		});
	} catch (err) {
		res.status(401).json({ success: false, message: 'Invalid username, please try again.', error: err });
	}
});

module.exports = router;
