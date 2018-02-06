/* global describe, it, before, after,
mockgoose, mongoose, jwt, opts, supertest, server,
expect, Author, Category */

// == run testing for author routes ==
describe('# Testing Author Routes', () => {
	// == This function will run before test to clear author collection ==
	let apiKey = null;
	before((done) => {
		mockgoose.prepareStorage().then(() => {
			mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
			mongoose.Promise = global.Promise;
			const db = mongoose.connection;
			db.on('error', (err) => { done(err); });
		});

		// == empty the author collection ==
		Author.remove({}).exec();

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

	// == In this test it's expected a author list ==
	describe('GET /api/v1/authors', () => {
		before((done) => {
			const author = new Author({
				fullname: 'John Doe',
				email: 'john@johndoe.com',
			});
			author.save();

			done();
		});

		it('returns a list of authors', (done) => {
			supertest(server)
				.get('/api/v1/authors')
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('__v', '_id', 'fullname', 'email', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results[0]).to.have.property('fullname').to.be.a('string');
					expect(res.body.results[0]).to.have.property('email').to.be.a('string');
					done(err);
				});
		});

		it('returns a list of authors per limit value (query string use case)', (done) => {
			supertest(server)
				.get('/api/v1/authors')
				.query({ offset: 0, limit: 10 })
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).to.be.an('object').that.has.all.keys('__v', '_id', 'fullname', 'email', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results[0]).to.have.property('fullname').to.be.a('string');
					expect(res.body.results[0]).to.have.property('email').to.be.a('string');
					done(err);
				});
		});
	});

	// == It's expected a spesific author ==
	describe('GET /api/v1/authors/{authorid}', () => {
		it('returns a spesific author id', (done) => {
			// == create a fake author ==
			const author = new Author({
				fullname: 'Jenny Doe',
				email: 'jenny@jennydoe.com',
			});

			author
				.save((err, data) => {
					supertest(server)
						.get(`/api/v1/authors/${data._id}`) /* eslint no-underscore-dangle: 0 */
						.set('Authorization', apiKey)
						.expect('Content-Type', /json/)
						.expect(200)
						.end((error, res) => {
							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'fullname', 'email', 'createdAt', 'updatedAt');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('fullname').to.be.a('string');
							expect(res.body.results).to.have.property('email').to.be.a('string');
							done(error);
						});
				});
		});

		// == testing for author not found ==
		it('returns a message authorid not found', (done) => {
			const fakeAuthor = { _id: '1234' };

			supertest(server)
				.get(`/api/v1/authors/${fakeAuthor._id}`)
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object').that.has.all.keys('success', 'message', 'error');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body).to.have.property('error').to.be.an('object');
					done(err);
				});
		});
	});

	// == Testing the save author expecting status 201 of success ==
	describe('POST /api/v1/authors', () => {
		it('saves a new author', (done) => {
			const newAuthor = {
				fullname: 'Jimmy Doe',
				email: 'jimmy@jimmydoe.com',
			};

			supertest(server)
				.post('/api/v1/authors')
				.set('Authorization', apiKey)
				.send(newAuthor)
				.expect('Content-Type', /json/)
				.expect(201)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'fullname', 'email', 'createdAt', 'updatedAt');
					expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results).to.have.property('fullname').to.be.a('string');
					expect(res.body.results).to.have.property('email').to.be.a('string');
					done(err);
				});
		});

		// == testing for failed to save new author ==
		it('returns a message failed to save author data', (done) => {
			const fakeAuthor = {
				fullname: 'Fake Doe',
				emails: 'fake@fakedoe.com',
				// wrong field `emails`
			};

			supertest(server)
				.post('/api/v1/authors')
				.set('Authorization', apiKey)
				.send(fakeAuthor)
				.expect('Content-Type', /json/)
				.expect(200)
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

	// == testing how to update an author ==
	describe('PUT /api/v1/authors{authorid}', () => {
		it('update an author', (done) => {
			const updateAuthor = {
				fullname: 'Billy Doe',
				email: 'billy@billydoe.com',
			};

			Author
				.findOne({})
				.exec((err, author) => {
					supertest(server)
						.put(`/api/v1/authors/${author._id}`)
						.set('Authorization', apiKey)
						.send({ ...updateAuthor, id: author._id })
						.expect('Content-Type', /json/)
						.expect(200)
						.end((error, res) => {
							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).to.be.an('object').that.has.all.keys('_id', 'fullname', 'email');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('fullname').to.be.a('string');
							expect(res.body.results).to.have.property('email').to.be.a('string');
							done(error);
						});
				});
		});

		// == testing for failed to update an author ==
		it('returns a message failed to update author data', (done) => {
			const fakeAuthor = {
				fullname: 'Fake Doe',
				email: 'fake@fakedoe.com',
				_id: 1234,
			};

			supertest(server)
				.put(`/api/v1/authors/${fakeAuthor._id}`)
				.set('Authorization', apiKey)
				.send(fakeAuthor)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('object').that.has.all.keys('message', 'name', 'stringValue', 'kind', 'value', 'path');
					expect(res.body.results).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.have.property('name').to.be.a('string').equal('CastError');
					expect(res.body.results).to.have.property('kind').to.be.a('string').equal('ObjectId');
					done(err);
				});
		});
	});

	// == testing how to delete an author ==
	describe('DELETE /api/authors/{authorid}', () => {
		before((done) => {
			// == because of the execution order of mocha,
			// the category must be created before book test case being execute ==
			const category = new Category({
				category_name: 'lolo',
			});
			category.save();
			done();
		});

		it('remove an author', (done) => {
			Author
				.findOne({})
				.exec((err, author) => {
					supertest(server)
						.delete(`/api/v1/authors/${author._id}`)
						.set('Authorization', apiKey)
						.expect(204)
						.end((error, res) => {
							expect(res.body).to.be.an('object');
							done(error);
						});
				});
		});

		it('returns a message failed to delete an author', (done) => {
			const author = { _id: 1234 };
			supertest(server)
				.delete(`/api/v1/authors/${author._id}`)
				.set('Authorization', apiKey)
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
