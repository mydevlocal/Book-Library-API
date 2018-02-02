'use strict';

// == run testing for book routes ==
describe('# Testing Book Routes', function() {
	// == This function will run before test to clear book collection ==
	let apiKey, categoryid, authorid = null;
	before(function(done) {
		mockgoose.prepareStorage().then(function() {
			mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
			mongoose.Promise = global.Promise;
			const db         = mongoose.connection;
			db.on('error', function(err) { done(err); });
		});
		
		// == empty the book collection ==
		Book.remove({}).exec();

		// == get author & category to save temporary book ==
		Author
			.findOne({})
			.then(function(author) {
				console.log('get author ', author._id);
				authorid = author._id;
				return Category.findOne({}).exec();
			})
			.then(function(category) {
				console.log('get category ', category._id);
				categoryid = category._id;
				return Book.count({}).exec();
			})
			.then(function(count) {
				let book = new Book({
					title: 'Book XII',
					category: categoryid,
					pages: 256,
					author: authorid,
					published: Date.now()
				});
				book.save(function(err, saved) {
					console.log('get saved ', saved._id);
				});					
			})
			.catch(function(err) { done(err); });

		// == generate token for testing ==
		let payload = { id: 'randomid0989835909' };

		jwt.sign(payload, opts.jwtSecret.tokenKey, function(err, token) {
			apiKey = token;
		});	
		done();
	});

	// == after passing all testing block, remove all of the collections from temp memory ==
	after(function(done) {
		mockgoose.helper.reset().then(function() {
			done();
		});
	});

	// == In this test it's expected a book list ==
	describe('GET /api/v1/books', function() {
		it('returns a list of books', function(done) {
			supertest(server)
				.get('/api/v1/books')
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					let today = res.body.results[0].published;
					
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string');
					expect(res.body.results[0]).to.have.property('title').to.be.a('string');
					expect(res.body.results[0]).to.have.property('category').to.be.an('object');
					expect(res.body.results[0]).to.have.property('pages').to.be.finite;
					expect(res.body.results[0]).to.have.property('author').to.be.an('object');
					expect(res.body.results[0]).to.have.property('published').to.equal(today);
					done(err);
				});
		});

		it('returns a list of books per limit value (query string use case)', function(done) {
			supertest(server)
				.get('/api/v1/books')
				.query({ offset: 0, limit: 10 })
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					let today = res.body.results[0].published;
					
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string');
					expect(res.body.results[0]).to.have.property('title').to.be.a('string');
					expect(res.body.results[0]).to.have.property('category').to.be.an('object');
					expect(res.body.results[0]).to.have.property('pages').to.be.finite;
					expect(res.body.results[0]).to.have.property('author').to.be.an('object');
					expect(res.body.results[0]).to.have.property('published').to.equal(today);
					done(err);
				});
		});
	});

	// == It's expected a spesific book ==
	describe('GET /api/v1/books/{bookid}', function() {
		it('returns a spesific book id', function(done) {
			// == create a fake book ==
			let book = new Book({
				title: 'Book V',
				category: categoryid,
				pages: 233,
				author: authorid,
				published: Date.now()
			});

			book
				.save(function(err, book) {
					supertest(server)
						.get(`/api/v1/books/${book._id}`)
						.set('Authorization', apiKey)
						.expect('Content-Type', /json/)
						.expect(200)
						.end(function(err, res) {
							let today = res.body.results.published;

							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'createdAt', 'updatedAt');
							expect(res.body.results).to.have.property('_id').to.be.a('string');
							expect(res.body.results).to.have.property('title').to.be.a('string');
							expect(res.body.results).to.have.property('category').to.be.an('object');
							expect(res.body.results).to.have.property('pages').to.be.finite;
							expect(res.body.results).to.have.property('author').to.be.an('object');
							expect(res.body.results).to.have.property('published').to.equal(today);
							done(err);
						});					
				});
		});

		// == testing for book not found ==
		it('returns a message bookid not found', function(done) {
			let fakeBook = { _id: '1234' };

			supertest(server)
				.get(`/api/v1/books/${fakeBook._id}`)
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.be.an('object').that.has.all.keys('success', 'message');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					done(err);
				});
		});
	});

	// == Testing the save book expecting status 201 of success ==
	describe('POST /api/v1/books', function() {
		it('saves a new book', function(done) {
			let newBook = {
				title: 'Book I',
				category: categoryid,
				pages: 198,
				author: authorid,
				published: Date.now()
			};
			
			supertest(server)
				.post('/api/v1/books')
				.set('Authorization', apiKey)
				.send(newBook)
				.expect('Content-Type', /json/)
				.expect(201)
				.end(function(err, res) {
					let today = res.body.results.published;

					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'createdAt', 'updatedAt');
					expect(res.body.results).to.have.property('_id').to.be.a('string');
					expect(res.body.results).to.have.property('title').to.be.a('string');
					expect(res.body.results).to.have.property('category').to.be.a('string');
					expect(res.body.results).to.have.property('pages').to.be.finite;
					expect(res.body.results).to.have.property('author').to.be.a('string');
					expect(res.body.results).to.have.property('published').to.equal(today);
					done(err);
				});
		});

		// == testing for failed to save new book ==
		it('returns a message failed to save book data', function(done) {
			let fakeBook = {
				title: 'Book I',
				categorys: categoryid,
				pages: 198,
				author: authorid,
				published: Date.now()
			};

			supertest(server)
				.post('/api/v1/books')
				.set('Authorization', apiKey)
				.send(fakeBook)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
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
	describe('PUT /api/v1/books{bookid}', function() {
		it('update a book', function(done) {
			let updateBook = {
				title: 'Book II',
				categorys: categoryid,
				pages: 199,
				author: authorid,
				published: Date.now()
			};

			Book
				.findOne({})
				.exec(function(err, book) {
					supertest(server)
						.put(`/api/v1/books/${book._id}`)
						.set('Authorization', apiKey)
						.send({...updateBook, id: book._id})
						.expect('Content-Type', /json/)
						.expect(200)
						.end(function(err, res) {
							let today = res.body.results.published;

							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'title', 'category', 'pages', 'author', 'published', 'createdAt', 'updatedAt');
							expect(res.body.results).to.have.property('_id').to.be.a('string');
							expect(res.body.results).to.have.property('title').to.be.a('string');
							expect(res.body.results).to.have.property('category').to.be.a('string');
							expect(res.body.results).to.have.property('pages').to.be.finite;
							expect(res.body.results).to.have.property('author').to.be.a('string');
							expect(res.body.results).to.have.property('published').to.equal(today);
							done(err);
						});
				});
		});

		// == testing for failed to update a book ==
		it('returns a message failed to update book data', function(done) {
			let fakeBook = {
				title: 'Book VII',
				categorys: categoryid,
				pages: 10,
				author: authorid,
				published: Date.now(),
				_id: 1234
			};

			supertest(server)
				.put(`/api/v1/books/${fakeBook._id}`)
				.set('Authorization', apiKey)
				.send(fakeBook)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body.results).to.be.an('object').that.has.all.keys('message', 'name', 'stringValue', 'kind', 'value', 'path');
					expect(res.body.results).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.have.property('name').to.be.a('string').equal('CastError');
					expect(res.body.results).to.have.property('kind').to.be.a('string').equal('ObjectId');
					done(err);
				});
		});
	});

	// == testing how to delete a book ==
	describe('DELETE /api/books/{bookid}', function() {
		it('remove a book', function(done) {
			Book
				.findOne({})
				.exec(function(err, book) {
					supertest(server)
						.delete(`/api/v1/books/${book._id}`)
						.set('Authorization', apiKey)
						.expect(204)
						.end(function(err, res) {
							expect(res.body).to.be.an('object');
							done(err);
						});
				});			
		});

		it('returns a message failed to delete a book', function(done) {
			let book = { _id: 1234 };
			supertest(server)
				.delete(`/api/v1/books/${book._id}`)
				.set('Authorization', apiKey)
				.end(function(err, res) {
					expect(res.body).to.be.an('object').that.has.all.keys('success', 'message');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					done(err);
				});	
		});
	});
});