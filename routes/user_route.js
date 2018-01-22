const express = require('express');
const jwt     = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user_model');
const opts = require('../config/options');

// == signup a user to get a speficic token ==
router.post('/signup', (req, res, next) => {
	let username     = req.body.username;
	let password     = req.body.password;

	User
		.findOne({ 'username': username })
		.then(user => {
			// if user found return immediately, else create a new user
			if (user) {
				res.json({ success: false, message: 'Username is already taken' });
			} else {
				let createUser = new User();

				// use 'encryptPassword' schema method to hash user password
				createUser.username  = username;
				createUser.password  = createUser.encryptPassword(password);

				// insert new user to database
				createUser
					.save()
					.then(result => {
						res.status(201).json({ success: true, message: 'Successful create a new user.' });
					})
					.catch(err => {
						res.status(500).json({ success: false, message: 'Unable to create new user.' });
					});
			}			
		})
		.catch(err => {
			res.status(500).json({ success: false, message: 'Cannot proceed your registration data, please try again.' });
		});
});

// == signin to get a token to use the api ==
router.post('/signin', (req, res, next) => {
	let username = req.body.username;
	let password = req.body.password;

	User
		.findOne({ 'username': username })
		.then(user => {
			// check entered user password
			if(!user.comparePassword(password)) {
				res.status(401).json({ success: false, message: 'Password didn\'t match.'});
			} else {
				// everything passed, set user id as payload
				let payload = { id: user._id };

				// sign the token, make it to expiresIn 3 days
				jwt.sign(payload, opts.jwtSecret.tokenKey, { expiresIn: '3d' }, (err, token) => {
					if (err) {
						res.status(401).json({ success: false, message: 'Cannot proceed the signature, please try again', error: err });
					} else {
						res.json({ success: true, message: 'Login success, get your token', token: token });
					}
				});
			}			
		})
		.catch(err => {
			res.status(401).json({ success: false, message: 'Invalid username, please try again.'});
		});
});

module.exports = router;