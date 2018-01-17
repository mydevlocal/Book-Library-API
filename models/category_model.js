const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const Schema = mongoose.Schema;
const CategorySchema = new Schema({
	category_name: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);