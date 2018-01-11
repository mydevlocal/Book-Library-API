const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');

const User     = require('./routes/user_route');
const Author   = require('./routes/author_route');
const Category = require('./routes/category_route');
const Book     = require('./routes/book_route');
const opts     = require('./config/options');

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const app = express();

mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
mongoose.Promise = global.Promise;

// set up middlewares
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set up routes
app.use('/api/v1', User);
app.use('/api/v1', Author);
app.use('/api/v1', Category);
app.use('/api/v1', Book);

// set up error handling
app.use((req, res, next) => {
	let err = new Error('No routes Found!');
	err.status = 404;
	next(err);
});

if (app.get('env') === 'development') {
	app.use((err, req, res, next) => {
		res.status(err.status || 500);
		res.send({ message: err.message, error: err });
	});
}

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.send({ message: err.message, error: {} });
});

// launch the server
app.listen(port, host);