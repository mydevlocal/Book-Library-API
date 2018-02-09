/* global describe, it, before, after,
mockgoose, mongoose, opts, supertest, server,
expect, User */

// == run testing for user routes ==
describe('# Testing User Routes', () => {
	// == This function will run before test to clear user collection ==
	before((done) => {
		mockgoose.prepareStorage().then(() => {
			mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
			mongoose.Promise = global.Promise;
			const db = mongoose.connection;
			db.on('error', (err) => { done(err); });
		});

		// == empty the user collection ==
		User.remove({}).exec();
		done();
	});

	// == after passing all testing block, remove all of the collections from temp memory ==
	after((done) => {
		mockgoose.helper.reset().then(() => {
			done();
		});
	});

	// == Testing the login user expecting status 200 of success ==
	describe('POST /api/v1/signin', () => {
		// == save temporary user ==
		before((done) => {
			const user = new User();
			user.username = 'John';
			user.password = '1234';
			user.fullname = 'John Doe';
			user.email = 'john@johndoe.com';
			user.address = 'localhost';
			user.phone_number = 19477294;

			user.save().then(() => { done(); });
		});

		it('Login success & get a token', (done) => {
			const loginUser = {
				username: 'John',
				password: '1234',
			};

			supertest(server)
				.post('/api/v1/signin')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body).to.have.property('token').to.be.a('string');
					done(err);
				});
		});

		it('returns a message password did not match with 401 status', (done) => {
			const loginUser = {
				username: 'John',
				password: '12345',
				// wrong password
			};

			supertest(server)
				.post('/api/v1/signin')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(401)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					done(err);
				});
		});

		it('returns a message invalid username with 401 status', (done) => {
			const loginUser = {
				username: 'john',
				password: '12345',
				// wrong username & wrong password
			};

			supertest(server)
				.post('/api/v1/signin')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(401)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					done(err);
				});
		});
	});

	// == Testing for signup user ==
	describe('POST /api/v1/signup', () => {
		before((done) => {
			// == remove user with username Jimmy ==
			User.remove({ username: 'Jimmy' }, (err) => {
				done(err);
			});
		});

		it('returns signup success message', (done) => {
			const loginUser = {
				username: 'Jimmy',
				password: '1234',
			};

			supertest(server)
				.post('/api/v1/signup')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(201)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					done(err);
				});
		});

		it('returns a message username already taken', (done) => {
			const loginUser = {
				username: 'John',
			};

			supertest(server)
				.post('/api/v1/signup')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					done(err);
				});
		});

		it('returns a message failed to signup', (done) => {
			const loginUser = {
				usernames: 'John',
			};

			supertest(server)
				.post('/api/v1/signup')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(500)
				.end((err, res) => {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body).to.have.property('error').to.be.an('object');
					done(err);
				});
		});
	});
});
