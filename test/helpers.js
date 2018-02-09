/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const { Mongoose } = require('mongoose');
const { Mockgoose } = require('mockgoose');

const mongoose = new Mongoose();
const mockgoose = new Mockgoose(mongoose);

const jwt = require('jsonwebtoken');
const chai = require('chai');
const supertest = require('supertest');

const opts = require('../config/options');
const server = require('../server');
const Author = require('../models/author_model');
const User = require('../models/user_model');
const Category = require('../models/category_model');
const Book = require('../models/book_model');

// set up global variable
global.mongoose = mongoose;
global.mockgoose = mockgoose;
global.jwt = jwt;
global.supertest = supertest;
global.chai = chai;
global.expect = chai.expect;
global.opts = opts;
global.server = server;
global.Author = Author;
global.User = User;
global.Category = Category;
global.Book = Book;
