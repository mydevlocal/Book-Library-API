/* eslint-disable */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;
const UserSchema = new Schema({
	username: { type: String, required: true },
	password: { type: String, required: true },
	fullname: { type: String },
	email: { type: String },
	address: { type: String },
	phone_number: { type: Number },
}, { timestamps: true });

const SALT_WORK_FACTOR = 10;

// generating a hash
UserSchema.pre('save', function (next) {
	const user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) return next(err);

		// hash the password using new salt/
		bcrypt.hash(user.password, salt, function (error, hash) {
			if (error) return next(error);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

/* eslint func-names: ["error", "never"] */
UserSchema.methods.comparePassword = function (enteredPassword, cb) {
	bcrypt.compare(enteredPassword, this.password, function (err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserSchema);
