const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user_model');
const opts = require('../config/options');

// == signup a user to get a speficic token ==
router.post('/signup', (req, res, next) => {
	let username     = req.body.username;
	let password     = req.body.password;

	User
		.findOne({ 'username': username }, (err, user) => {
			if (err) {
				return next(new Error('Error when trying to find existing user!'));
			}

			// if user found return immediately, else create a new user
			if (user) {
				res.json({ success: false, message: 'Username is already taken' });
			} else {
				let createUser = new User();

				createUser.username  = username;
				createUser.password  = createUser.encryptPassword(password);

				createUser.save((err, result) => {
					if (err) {
						return next(new Error('Failed to create a new user!'));
					} else {
						res.status(201).json({ success: true, message: 'Successful create a new user.' });
					}
				});
			}
		});
});

// == signin to get a token to use the api ==
router.post('/signin', (req, res, next) => {
	let username = req.body.username;
	let password = req.body.password || '';

	User
		.findOne({ 'username': username }, (err, user) => {
			if (err) {
				return next(new Error('Error when trying to signin!'));
			}

			if (!user) {
				res.status(401).json({ success: false, message: 'No such user found.'});
			}

			if(!user.comparePassword(password)) {
				res.status(401).json({ success: false, message: 'Password didn\'t match.'});
			} else {
				// everyting passed
				let payload = { id: user._id };

				jwt.sign(payload, opts.jwtSecret.tokenKey, { expiresIn: '3d' }, (err, token) => {
					if (err) {
						res.status(401).json({ success: false, message: 'Cannot proceed the signature, please try again', error: err });
					} else {
						res.json({ success: true, message: 'Login success, get your token', token: token });
					}
				});
			}
		});
});

module.exports = router;