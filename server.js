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

const port = process.env.PORT;
const host = process.env.HOST;

const app = express();

//Set up default mongoose connection
mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
const db         = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// set up middlewares
app.use(helmet());
app.use(cors({
	origin: true,
	methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	preflighContinues: true,
	credentials: true
}));

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