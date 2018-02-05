/* eslint one-var: ["error", { var: "never" }] */
const jwt = require('jsonwebtoken');

const opts = require('./options');

exports.TokenVerification = (req, res, next) => {
	let token,
		getBearerVal;
	const bearerVal = req.headers.authorization;

	if (bearerVal) {
		getBearerVal = bearerVal.split(' ');
		token = getBearerVal[getBearerVal.length - 1];
	} else {
		token = req.body.token || req.query.token;
	}

	// token value is ready to use
	if (token) {
		jwt.verify(token, opts.jwtSecret.tokenKey, (err, decoded) => {
			if (err) {
				res.status(401).json({ success: false, message: 'Failed to authenticate the token!', error: err });
			}
			req.decoded = decoded;
			return next();
		});
	} else {
		res.status(403).json({ success: false, message: 'No token provided!' });
	}
};
