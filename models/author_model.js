const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const Schema = mongoose.Schema;
const AuthorSchema = new Schema({
	fullname: { type: String },
	email: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Author', AuthorSchema);