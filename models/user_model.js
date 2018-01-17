const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
	username: { type: String, required: true },
	password: { type: String, required: true },
	fullname: { type: String },
	email: { type: String },
	address: { type: String },
	phone_number: { type: Number }
}, { timestamps: true });

// generating a hash
UserSchema.methods.encryptPassword = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
}

UserSchema.methods.comparePassword = function(password) {
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);