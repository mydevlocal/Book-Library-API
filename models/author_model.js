const mongoose = require('mongoose');

const { Schema } = mongoose;
const AuthorSchema = new Schema({
	fullname: { type: String, required: true },
	email: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Author', AuthorSchema);
