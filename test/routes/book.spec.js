/* global describe, it, before, after,
mockgoose, mongoose, jwt, opts, supertest, server,
expect, Author, Book, Category */

// == run testing for book routes ==
describe('# Testing Book Routes', () => {
	// == This function will run before test to clear book collection ==
	// `const` and `let` declarations are ignored if they are not specified
	/* eslint one-var: ["error", { var: "never" }] */
	let apiKey,
		authorid,
		categoryid;

	before((done) => {
		mockgoose.prepareStorage().then(() => {
			mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
			mongoose.Promise = global.Promise;
			const db = mongoose.connection;
			db.on('error', (err) => { done(err); });
		});

		// == empty the book collection ==
		Book.remove({}).exec();

		// == get author id to save temporary book ==
		Author
			.findOne({})
			.exec((err, author) => {
				if (err) done(err);
				authorid = author._id; /* eslint no-underscore-dangle: 0 */
			});

		// == generate token for testing ==
		const payload = { id: 'randomid0989835909' };

		jwt.sign(payload, opts.jwtSecret.tokenKey, (err, token) => {
			apiKey = token;
		});
		done();
	});

	// == after passing all testing block, remove all of the collections from temp memory ==
	after((done) => {
		mockgoose.helper.reset().then(() => {
			done();
		});
	});

	// == In this test it's expected a book list ==
	describe('GET /api/v1/books', () => {
		before((done) => {
			Book.count({}).then((count) => {
				if (count === 0) {
					Category
						.findOne({})
						.then((category) => {
							categoryid = category._id; /* eslint no-underscore-dangle: 0 */

							// == categoryid is ready, then save new temp book ==
							const book = new Book({
								title: 'Book XII',
								category: categoryid,
								pages: 256,
								author: authorid,
								published: Date.now(),
								synopsis: 'Lorem ipsum dolor nam sit rerum adipisci nihil id totam.',
							});
							book.save();
						}).catch((err) => { done(err); });
				}
			}).catch((err) => { done(err); });
			done();
		});

		it('returns a list of books', (done) => {
			supertest(server)
				.get('/api/v1/books')
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'synopsis', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results[0]).to.have.property('title').to.be.a('string');
					expect(res.body.results[0]).to.have.property('category').to.be.an('object');
					/* eslint-disable */
					expect(res.body.results[0]).to.have.property('pages').to.be.finite;
					/* eslint-enable */
					expect(res.body.results[0]).to.have.property('author').to.be.an('object');
					expect(res.body.results[0]).to.have.property('published').to.equal(res.body.results[0].published);
					expect(res.body.results[0]).to.have.property('synopsis').to.be.a('string');
					done(err);
				});
		});

		it('returns a list of books per limit value (query string use case)', (done) => {
			supertest(server)
				.get('/api/v1/books')
				.query({ offset: 0, limit: 10 })
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					const today = res.body.results[0].published;

					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'synopsis', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results[0]).to.have.property('title').to.be.a('string');
					expect(res.body.results[0]).to.have.property('category').to.be.an('object');
					/* eslint-disable */
					expect(res.body.results[0]).to.have.property('pages').to.be.finite;
					/* eslint-enable */
					expect(res.body.results[0]).to.have.property('author').to.be.an('object');
					expect(res.body.results[0]).to.have.property('published').to.equal(today);
					expect(res.body.results[0]).to.have.property('synopsis').to.be.a('string');
					done(err);
				});
		});
	});

	// == It's expected a spesific book ==
	describe('GET /api/v1/books/{bookid}', () => {
		it('returns a spesific book id', (done) => {
			// == create a fake book ==
			const book = new Book({
				title: 'Book V',
				category: categoryid,
				pages: 233,
				author: authorid,
				published: Date.now(),
				synopsis: 'Lorem ipsum dolor nam sit rerum adipisci nihil id totam.',
			});

			book
				.save((err, data) => {
					supertest(server)
						.get(`/api/v1/books/${data._id}`)
						.set('Authorization', apiKey)
						.expect('Content-Type', /json/)
						.expect(200)
						.end((error, res) => {
							const today = res.body.results.published;

							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'synopsis', 'createdAt', 'updatedAt');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('title').to.be.a('string');
							expect(res.body.results).to.have.property('category').to.be.an('object');
							/* eslint-disable */
							expect(res.body.results).to.have.property('pages').to.be.finite;
							/* eslint-enable */
							expect(res.body.results).to.have.property('author').to.be.an('object');
							expect(res.body.results).to.have.property('published').to.equal(today);
							expect(res.body.results).to.have.property('synopsis').to.be.a('string');
							done(error);
						});
				});
		});

		// == testing for book not found ==
		it('returns a unknown server error when trying to find book with id', (done) => {
			const fakeBook = { _id: '1234' };

			supertest(server)
				.get(`/api/v1/books/${fakeBook._id}`) /* eslint no-underscore-dangle: 0 */
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(500)
				.end((err, res) => {
					expect(res.body).to.be.an('object').that.has.all.keys('success', 'message', 'error');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body).to.have.property('error').to.be.an('object');
					done(err);
				});
		});
	});

	// == It's expected to display all books, synopsis & the populer books
	// no token required for these 3 endpoint (display,display/:title,populer) ==
	describe('GET /api/v1/books/display', () => {
		it('returns a list of book (no apikey required)', (done) => {
			supertest(server)
				.get('/api/v1/books/display')
				.query({ offset: 0, limit: 9 })
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					const today = res.body.results[0].published;

					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'synopsis', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results[0]).to.have.property('title').to.be.a('string');
					expect(res.body.results[0]).to.have.property('category').to.be.an('object');
					/* eslint-disable */
					expect(res.body.results[0]).to.have.property('pages').to.be.finite;
					/* eslint-enable */
					expect(res.body.results[0]).to.have.property('author').to.be.an('object');
					expect(res.body.results[0]).to.have.property('published').to.equal(today);
					expect(res.body.results[0]).to.have.property('synopsis').to.be.a('string');
					done(err);
				});
		});

		it('returns a list of matched books title (no apikey required)', (done) => {
			const title = 'book';

			supertest(server)
				.get(`/api/v1/books/display/${title}`)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((error, res) => {
					const today = res.body.results[0].published;

					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'synopsis', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results[0]).to.have.property('title').to.be.a('string');
					expect(res.body.results[0]).to.have.property('category').to.be.an('object');
					/* eslint-disable */
					expect(res.body.results[0]).to.have.property('pages').to.be.finite;
					/* eslint-enable */
					expect(res.body.results[0]).to.have.property('author').to.be.an('object');
					expect(res.body.results[0]).to.have.property('published').to.equal(today);
					expect(res.body.results[0]).to.have.property('synopsis').to.be.a('string');
					done(error);
				});
		});
	});

	describe('GET /api/v1/books/populer', () => {
		it('returns a list of populer book (no apikey required)', (done) => {
			supertest(server)
				.get('/api/v1/books/populer')
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('_id', 'title');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results[0]).to.have.property('title').to.be.a('string');
					done(err);
				});
		});
	});

	describe('GET /api/v1/books/synopsis/{bookid}', () => {
		it('returns a book\'s synopsis {no apiKey required}', (done) => {
			// == create a fake book ==
			const book = new Book({
				title: 'Book V',
				category: categoryid,
				pages: 233,
				author: authorid,
				published: Date.now(),
				synopsis: 'Lorem ipsum dolor nam sit rerum adipisci nihil id totam.',
			});

			book
				.save((err, data) => {
					supertest(server)
						.get(`/api/v1/books/synopsis/${data._id}`)
						.expect('Content-Type', /json/)
						.expect(200)
						.end((error, res) => {
							const today = res.body.results.published;

							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'synopsis', 'createdAt', 'updatedAt');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('title').to.be.a('string');
							expect(res.body.results).to.have.property('category').to.be.a('string');
							/* eslint-disable */
							expect(res.body.results).to.have.property('pages').to.be.finite;
							/* eslint-enable */
							expect(res.body.results).to.have.property('author').to.be.a('string');
							expect(res.body.results).to.have.property('published').to.equal(today);
							expect(res.body.results).to.have.property('synopsis').to.be.a('string');
							done(error);
						});
				});
		});

		it('returns a unknown server error when trying to find book with id', (done) => {
			const fakeBook = { _id: '1234' };

			supertest(server)
				.get(`/api/v1/books/synopsis/${fakeBook._id}`) /* eslint no-underscore-dangle: 0 */
				.expect('Content-Type', /json/)
				.expect(500)
				.end((err, res) => {
					expect(res.body).to.be.an('object').that.has.all.keys('success', 'message', 'error');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body).to.have.property('error').to.be.an('object');
					done(err);
				});
		});
	});

	// == Testing the save book expecting status 201 of success ==
	describe('POST /api/v1/books', () => {
		it('saves a new book', (done) => {
			const newBook = {
				title: 'Book I',
				category: categoryid,
				pages: 198,
				author: authorid,
				published: Date.now(),
				synopsis: 'Lorem ipsum dolor nam sit rerum adipisci nihil id totam.',
			};

			supertest(server)
				.post('/api/v1/books')
				.set('Authorization', apiKey)
				.send(newBook)
				.expect('Content-Type', /json/)
				.expect(201)
				.end((err, res) => {
					const today = res.body.results.published;

					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'synopsis', 'createdAt', 'updatedAt');
					expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results).to.have.property('title').to.be.a('string');
					expect(res.body.results).to.have.property('category').to.be.a('string');
					/* eslint-disable */
					expect(res.body.results).to.have.property('pages').to.be.finite;
					/* eslint-enable */
					expect(res.body.results).to.have.property('author').to.be.a('string');
					expect(res.body.results).to.have.property('published').to.equal(today);
					expect(res.body.results).to.have.property('synopsis').to.be.a('string');
					done(err);
				});
		});

		// == testing for failed to save new book ==
		it('returns a message unknown server error when trying to save new book', (done) => {
			const fakeBook = {
				title: 'Book I',
				categorys: categoryid,
				pages: 198,
				author: authorid,
				published: Date.now(),
				synopsis: 'Lorem ipsum dolor nam sit rerum adipisci nihil id totam.',
			};

			supertest(server)
				.post('/api/v1/books')
				.set('Authorization', apiKey)
				.send(fakeBook)
				.expect('Content-Type', /json/)
				.expect(500)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('object').that.has.all.keys('errors', '_message', 'message', 'name');
					expect(res.body.results).to.have.property('errors').to.be.an('object');
					expect(res.body.results).to.have.property('name').to.be.a('string').equal('ValidationError');
					done(err);
				});
		});
	});

	// == testing how to update a book ==
	describe('PUT /api/v1/books{bookid}', () => {
		it('update a book', (done) => {
			const updateBook = {
				title: 'Book II',
				category: categoryid,
				pages: 199,
				author: authorid,
				published: Date.now(),
				synopsis: 'Lorem ipsum dolor nam sit rerum adipisci nihil id totam.',
			};

			Book
				.findOne({})
				.exec((err, book) => {
					supertest(server)
						.put(`/api/v1/books/${book._id}`)
						.set('Authorization', apiKey)
						.send({ ...updateBook, id: book._id })
						.expect('Content-Type', /json/)
						.expect(200)
						.end((error, res) => {
							const today = res.body.results.published;

							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).to.be.an('object').that.has.all.keys('_id', 'title', 'category', 'pages', 'author', 'published', 'synopsis');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('title').to.be.a('string');
							expect(res.body.results).to.have.property('category').to.be.a('string');
							/* eslint-disable */
							expect(res.body.results).to.have.property('pages').to.be.finite;
							/* eslint-enable */
							expect(res.body.results).to.have.property('author').to.be.a('string');
							expect(res.body.results).to.have.property('published').to.equal(today);
							expect(res.body.results).to.have.property('synopsis').to.be.a('string');
							done(error);
						});
				});
		});

		// == testing for failed to update a book ==
		it('returns a message failed to update book data', (done) => {
			const fakeBook = {
				title: 'Book VII',
				categorys: categoryid,
				pages: 10,
				author: authorid,
				published: Date.now(),
				synopsis: 'Lorem ipsum dolor nam sit rerum adipisci nihil id totam.',
				_id: mongoose.Types.ObjectId(123456789012),
			};

			supertest(server)
				.put(`/api/v1/books/${fakeBook._id}`)
				.set('Authorization', apiKey)
				.send(fakeBook)
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					done(err);
				});
		});

		it('returns a message unknown server error when trying to update', (done) => {
			const fakeBook = {
				title: 'Book VII',
				categorys: categoryid,
				pages: 10,
				author: authorid,
				published: Date.now(),
				synopsis: 'Lorem ipsum dolor nam sit rerum adipisci nihil id totam.',
				_id: 1234,
			};

			supertest(server)
				.put(`/api/v1/books/${fakeBook._id}`)
				.set('Authorization', apiKey)
				.send(fakeBook)
				.expect('Content-Type', /json/)
				.expect(500)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.error).to.be.an('object').that.has.all.keys('message', 'name', 'stringValue', 'kind', 'value', 'path');
					expect(res.body.error).to.have.property('message').to.be.a('string');
					expect(res.body.error).to.have.property('name').to.be.a('string').equal('CastError');
					expect(res.body.error).to.have.property('kind').to.be.a('string').equal('ObjectId');
					done(err);
				});
		});
	});

	// == testing how to delete a book ==
	describe('DELETE /api/books/{bookid}', () => {
		it('remove a book', (done) => {
			Book
				.findOne({})
				.exec((err, book) => {
					supertest(server)
						.delete(`/api/v1/books/${book._id}`)
						.set('Authorization', apiKey)
						.expect(204)
						.end((error, res) => {
							expect(res.body).to.be.an('object');
							done(error);
						});
				});
		});

		it('returns a message failed to delete a book', (done) => {
			const book = { _id: mongoose.Types.ObjectId(123456789012) };
			supertest(server)
				.delete(`/api/v1/books/${book._id}`)
				.set('Authorization', apiKey)
				.expect(404)
				.end((err, res) => {
					expect(res.body).to.be.an('object').that.has.all.keys('success', 'message');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					done(err);
				});
		});

		it('returns a message unknown server error when trying to delete', (done) => {
			const book = { _id: 1234 };
			supertest(server)
				.delete(`/api/v1/books/${book._id}`)
				.set('Authorization', apiKey)
				.expect(500)
				.end((err, res) => {
					expect(res.body).to.be.an('object').that.has.all.keys('success', 'message', 'error');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body).to.have.property('error').to.be.an('object');
					done(err);
				});
		});
	});
});
