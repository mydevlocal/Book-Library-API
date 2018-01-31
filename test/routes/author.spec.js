'use strict';

chai.use(chaitHttp);

// == run testing for author routes ==
describe('# Testing Author Routes', function() {
	// == This function will run before test to clear author collection ==
	let apiKey = null;
	before(function(done) {
		mockgoose.prepareStorage().then(function() {
			mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
			mongoose.Promise = global.Promise;
			const db         = mongoose.connection;
			db.on('error', function(err) { done(err); });
		});
		
		// == empty the author collection ==
		Author.remove({}, function(err) {
			done();
		});

		// == save temporary author ==
		let author = new Author({
			fullname: 'John Doe',
			email: 'john@johndoe.com'
		});
		author.save();

		// == generate token for testing ==
		User
			.create({ 'username': 'testing', 'password': 'testing' })
			.then(function(newUser) {
				let payload = { id: newUser._id };

				jwt.sign(payload, opts.jwtSecret.tokenKey, { expiresIn: '3d' }, function(err, token) {
					apiKey = token;
				});	
			})
			.catch(function(err) { done(err); });
	});

	// == after passing all testing block, remove user collection & stop mongoose connection ==
	after(function(done) {
		User.remove({});
		mongoose.connection.close(function() { done(); });
	});

	// == In this test it's expected a author list ==
	describe('GET /api/v1/authors', function() {
		it('returns a list of authors', function(done) {
			chai.request(server)
				.get('/api/v1/authors')
				.set('Authorization', apiKey)
				.end(function(err, res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(true);
					expect(res.body.results).to.be.an('array');
					done(err);
				});
		});

		it('returns a list of authors per limit value (query string use case)', function(done) {
			chai.request(server)
				.get('/api/v1/authors')
				.query({ offset: 0, limit: 10 })
				.set('Authorization', apiKey)
				.end(function(err, res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(true);
					expect(res.body.results).to.be.an('array');
					done(err);
				});
		});
	});

	// It's expected a spesific author
	describe('GET /api/v1/authors/{authorid}', function() {
		it('returns a spesific author id', function(done) {
			// == create a fake author ==
			let author = new Author({
				fullname: 'Jenny Doe',
				email: 'jenny@jennydoe.com'
			});

			author
				.save(function(err, author) {
					chai.request(server)
						.get(`/api/v1/authors/${author._id}`)
						.set('Authorization', apiKey)
						.end(function(err, res) {
							expect(res).to.have.status(200);
							expect(res).to.be.json;
							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').eql(true);
							expect(res.body.results).to.be.an('object');
							done(err);
						});					
				});
		});

		// == testing for author not found ==
		it('returns a message authorid not found', function(done) {
			let fakeAuthor = { _id: '1234' };

			chai.request(server)
				.get(`/api/v1/authors/${fakeAuthor._id}`)
				.set('Authorization', apiKey)
				.end(function(err, res) {
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(false);
					done(err);
				});
		});
	});

	// Testing the save author expecting status 201 of success
	describe('POST /api/v1/authors', function() {
		it('saves a new author', function(done) {
			let newAuthor = {
				fullname: 'Jimmy Doe',
				email: 'jimmy@jimmydoe.com'
			};
			
			chai.request(server)
				.post('/api/v1/authors')
				.set('Authorization', apiKey)
				.send(newAuthor)
				.end(function(err, res) {
					expect(res).to.have.status(201);
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(true);
					expect(res.body.results).to.be.an('object');
					expect(res.body.results).to.have.property('fullname').to.be.a('string');
					expect(res.body.results).to.have.property('email').to.be.a('string');
					done(err);
				});
		});

		// == testing for failed to save new author ==
		it('returns a message failed to save author data', function(done) {
			let fakeAuthor = {
				fullname: 'Fake Doe',
				emails: 'fake@fakedoe.com'
			};

			chai.request(server)
				.post('/api/v1/authors')
				.set('Authorization', apiKey)
				.send(fakeAuthor)
				.end(function(err, res) {
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(false);
					expect(res.body.results).to.be.an('object');
					expect(res.body.results).to.have.property('errors').to.be.an('object');
					expect(res.body.results).to.have.property('name').to.be.a('string').eql('ValidationError');
					done(err);
				});
		});
	});

	// testing how to update an author
	describe('PUT /api/v1/authors{authorid}', function() {
		it('update an author', function(done) {
			let updateAuthor = {
				fullname: 'Billy Doe',
				email: 'billy@billydoe.com',
			};

			Author
				.findOne({})
				.exec(function(err, author) {
					chai.request(server)
						.put(`/api/v1/authors/${author._id}`)
						.set('Authorization', apiKey)
						.send({...updateAuthor, id: author._id})
						.end(function(err, res) {
							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').eql(true);
							expect(res.body.results).to.be.an('object');
							expect(res.body.results).to.have.property('fullname').to.be.a('string');
							expect(res.body.results).to.have.property('email').to.be.a('string');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							done(err);
						});
				});
		});

		// == testing for failed to update an author ==
		it('returns a message failed to update author data', function(done) {
			let fakeAuthor = {
				fullname: 'Fake Doe',
				email: 'fake@fakedoe.com',
				_id: 1234
			};

			chai.request(server)
				.put(`/api/v1/authors/${fakeAuthor._id}`)
				.set('Authorization', apiKey)
				.send(fakeAuthor)
				.end(function(err, res) {
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(false);
					expect(res.body.results).to.be.an('object');
					expect(res.body.results).to.have.property('name').to.be.a('string').eql('CastError');
					expect(res.body.results).to.have.property('kind').to.be.a('string').eql('ObjectId');
					done(err);
				});
		});
	});

	// testing how to delete an author
	describe('DELETE /api/authors/{authorid}', function() {
		it('remove an author', function(done) {
			Author
				.findOne({})
				.exec(function(err, author) {
					chai.request(server)
						.delete(`/api/v1/authors/${author._id}`)
						.set('Authorization', apiKey)
						.end(function(err, res) {
							expect(res).to.have.status(204);
							expect(res.body).to.be.an('object');
							done(err);
						});
				});			
		});
	});
});