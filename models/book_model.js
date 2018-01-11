const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const Schema = mongoose.Schema;
const BookSchema = new Schema({
	title: { type: String, required: true },
	category: { type: mongoose.Schema.ObjectId, ref: 'Category' },
	pages: { type: Number },
	author: { type: mongoose.Schema.ObjectId, ref: 'Author' },
	published: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now() },
	updatedAt: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Book', BookSchema);