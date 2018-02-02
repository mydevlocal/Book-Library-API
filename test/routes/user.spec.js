'use strict';

// == run testing for user routes ==
describe('# Testing User Routes', function() {
	// == This function will run before test to clear user collection ==
	before(function(done) {
		mockgoose.prepareStorage().then(function() {
			mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
			mongoose.Promise = global.Promise;
			const db         = mongoose.connection;
			db.on('error', function(err) { done(err); });
		});
		
		// == empty the user collection ==
		User.remove({}).exec();

		// == save temporary user ==
		User
			.count({})
			.then(function(count) {
				if (count === 0) {
					let user = new User();
					user.username     = 'John';
					user.password     = user.encryptPassword('1234');
					user.fullname     = 'John Doe';
					user.email        = 'john@johndoe.com';
					user.address      = 'localhost';
					user.phone_number = 19477294;

					user.save();
				}
			}).catch(function(err) { done(err); });
			done();			
	});

	// == after passing all testing block, remove all of the collections from temp memory ==
	after(function(done) {
		mockgoose.helper.reset().then(function() {
			done();
		});
	});

	// == Testing the login user expecting status 200 of success ==
	describe('POST /api/v1/signin', function() {
		it('Login success & get a token', function(done) {
			let loginUser = {
				username: 'John',
				password: '1234'
			};
			
			supertest(server)
				.post('/api/v1/signin')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(true);
					expect(res.body).to.have.property('token').to.be.a('string');
					done(err);
				});
		});

		it('returns a message password did not match with 401 status', function(done) {
			let loginUser = {
				username: 'John',
				password: '12345'  // wrong password
			};
			
			supertest(server)
				.post('/api/v1/signin')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(401)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(false);
					done(err);
				});
		});

		it('returns a message invalid username with 401 status', function(done) {
			let loginUser = {
				username: 'john',  // wrong username
				password: '12345'  // wrong password
			};
			
			supertest(server)
				.post('/api/v1/signin')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(401)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(false);
					done(err);
				});
		});
	});

	// == Testing for signup user == 
	describe('POST /api/v1/signup', function() {
		before(function(done) {
			// == remove user with username Jimmy ==
			User.remove({ 'username': 'Jimmy' }, function(err) {
				done(err);
			});
		});

		it('returns signup success message', function(done) {
			let loginUser = {
				username: 'Jimmy',
				password: '1234'
			};
			
			supertest(server)
				.post('/api/v1/signup')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(201)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(true);
					done(err);
				});
		});

		it('returns a message username already taken', function(done) {
			let loginUser = {
				username: 'John'
			};
			
			supertest(server)
				.post('/api/v1/signup')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(false);
					done(err);
				});
		});

		it('returns a message failed to signup', function(done) {
			let loginUser = {
				usernamse: 'John'
			};
			
			supertest(server)
				.post('/api/v1/signup')
				.send(loginUser)
				.expect('Content-Type', /json/)
				.expect(500)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').eql(false);
					done(err);
				});
		});
	});
});