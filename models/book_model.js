const mongoose = require('mongoose');

const { Schema } = mongoose;
const BookSchema = new Schema({
	title: { type: String, required: true },
	category: { type: mongoose.Schema.ObjectId, ref: 'Category', required: true },
	pages: { type: Number },
	author: { type: mongoose.Schema.ObjectId, ref: 'Author', required: true },
	published: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
