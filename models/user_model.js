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
	return bcrypt.genSalt(SALT_WORK_FACTOR).then((salt) => {
		// hash the password using new salt/
		return bcrypt.hash(user.password, salt).then((hash) => {
			// override the cleartext password with the hashed one
			user.password = hash;
			return next();
		}).catch(next);
	}).catch(next);
});

/* eslint func-names: ["error", "never"] */
UserSchema.methods.comparePassword = function (enteredPassword, cb) {
	return bcrypt.compare(enteredPassword, this.password).then((isMatch) => {
		return cb(null, isMatch);
	}).catch(cb);
};

module.exports = mongoose.model('User', UserSchema);
