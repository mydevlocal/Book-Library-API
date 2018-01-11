const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const Schema = mongoose.Schema;
const CategorySchema = new Schema({
	category_name: { type: String },
	createdAt: { type: Date, default: Date.now() },
	updatedAt: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Category', CategorySchema);