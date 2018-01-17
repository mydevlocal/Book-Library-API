const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const Schema = mongoose.Schema;
const BookSchema = new Schema({
	title: { type: String, required: true },
	category: { type: mongoose.Schema.ObjectId, ref: 'Category' },
	pages: { type: Number },
	author: { type: mongoose.Schema.ObjectId, ref: 'Author' },
	published: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);