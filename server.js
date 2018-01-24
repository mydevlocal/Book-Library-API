const express    = require('express');
const path       = require('path');
const helmet     = require('helmet');
const cors       = require('cors');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const bunyan     = require('bunyan');

const User     = require('./routes/user_route');
const Author   = require('./routes/author_route');
const Category = require('./routes/category_route');
const Book     = require('./routes/book_route');
const opts     = require('./config/options');

const port = process.env.PORT;
const host = process.env.HOST;

const app = express();

// Set up default mongoose connection
// Get Mongoose to use the global promise library
// Get the default connection
// Bind connection info to log file
mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
mongoose.Promise = global.Promise;
const db         = mongoose.connection;

// Set up mongodb connection log info into a file
let mongoLog = bunyan.createLogger({
  name: 'mongodb-connection-log',
  streams: [
    {
      level: 'info',
      path: __dirname + '/logs/mongodb-connection.log'
    }
  ]
});
db.on('error', (err) => mongoLog.info(err));

// Set up app log for tracking error and info into file
let log = bunyan.createLogger({
  name: 'book-library-log',
  streams: [
    {
      level: 'info',
      path: __dirname + '/logs/error.log'
    },
    {
      level: 'error',
      path: __dirname + '/logs/error.log' 
    }
  ]
});
log.info();
log.error();

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
app.use('/', express.static(path.join(__dirname, 'public')));
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