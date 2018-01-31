const Mongoose  = require('mongoose').Mongoose;
const mongoose  = new Mongoose();
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const jwt       = require('jsonwebtoken');
const chai      = require('chai');
const expect    = require('chai').expect;
const chaitHttp = require('chai-http');

const opts   = require('../config/options');
const server = require('../server');
const Author = require('../models/author_model');
const User   = require('../models/user_model');

// set up global variable
global.mongoose  = mongoose;
global.mockgoose = mockgoose;
global.jwt       = jwt;
global.chai      = chai;
global.expect    = chai.expect;
global.chaitHttp = chaitHttp;
global.opts      = opts;
global.server    = server;
global.Author    = Author;
global.User      = User;
