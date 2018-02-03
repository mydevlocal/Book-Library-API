'use strict';

// == run testing for category routes ==
describe('# Testing Category Routes', function() {
	// == This function will run before test to clear category collection ==
	let apiKey = null;
	before(function(done) {
		mockgoose.prepareStorage().then(function() {
			mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
			mongoose.Promise = global.Promise;
			const db         = mongoose.connection;
			db.on('error', function(err) { done(err); });
		});
		
		// == empty the category collection ==
		Category.remove({}).exec();

		// == save temporary category ==
		Category
			.count({})
			.then(function(count) {
				if (count === 0) {
					let category = new Category({
						category_name: 'Romance'
					});
					category.save();					
				}
			}).catch(function(err) { done(err); });

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

	// == In this test it's expected a category list ==
	describe('GET /api/v1/categories', function() {
		it('returns a list of categories', function(done) {
			supertest(server)
				.get('/api/v1/categories')
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('array');
					expect(res.body.results[0]).that.has.all.keys('__v', '_id', 'category_name', 'createdAt', 'updatedAt');
					expect(res.body.results[0]).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results[0]).to.have.property('category_name').to.be.a('string');
					done(err);
				});
		});
	});

	// == It's expected a spesific category ==
	describe('GET /api/v1/categories/{categoryid}', function() {
		it('returns a spesific category id', function(done) {
			// == create a fake category ==
			let category = new Category({
				category_name: 'Comedy',
			});

			category
				.save(function(err, category) {
					supertest(server)
						.get(`/api/v1/categories/${category._id}`)
						.set('Authorization', apiKey)
						.expect('Content-Type', /json/)
						.expect(200)
						.end(function(err, res) {
							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).that.has.all.keys('__v', '_id', 'category_name', 'createdAt', 'updatedAt');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('category_name').to.be.a('string');
							done(err);
						});					
				});
		});

		// == testing for category not found ==
		it('returns a message categoryid not found', function(done) {
			let fakeCategory = { _id: '1234' };

			supertest(server)
				.get(`/api/v1/categories/${fakeCategory._id}`)
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

	// == Testing the save category expecting status 201 of success ==
	describe('POST /api/v1/categories', function() {
		it('saves a new category', function(done) {
			let newCategory = {
				category_name: 'Fiction',
			};
			
			supertest(server)
				.post('/api/v1/categories')
				.set('Authorization', apiKey)
				.send(newCategory)
				.expect('Content-Type', /json/)
				.expect(201)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(true);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('object').that.has.all.keys('__v', '_id', 'category_name', 'createdAt', 'updatedAt');
					expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
					expect(res.body.results).to.have.property('category_name').to.be.a('string');
					done(err);
				});
		});

		// == testing for failed to save new category ==
		it('returns a message failed to save category data', function(done) {
			let fakeCategory = {
				category_names: 'Literature'
			};

			supertest(server)
				.post('/api/v1/categories')
				.set('Authorization', apiKey)
				.send(fakeCategory)
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

	// == testing how to update a category ==
	describe('PUT /api/v1/categories{categoryid}', function() {
		it('update a category', function(done) {
			let updateCategory = {
				category_name: 'Sci-Fi',
			};

			Category
				.findOne({})
				.exec(function(err, category) {
					supertest(server)
						.put(`/api/v1/categories/${category._id}`)
						.set('Authorization', apiKey)
						.send({...updateCategory, id: category._id})
						.expect('Content-Type', /json/)
						.expect(200)
						.end(function(err, res) {
							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).to.be.an('object').that.has.all.keys('_id', 'category_name');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('category_name').to.be.a('string');
							done(err);
						});
				});
		});

		// == testing for failed to update a category ==
		it('returns a message failed to update category data', function(done) {
			let fakeCategory = {
				category_name: 'Mistery',
				_id: 1234
			};

			supertest(server)
				.put(`/api/v1/categories/${fakeCategory._id}`)
				.set('Authorization', apiKey)
				.send(fakeCategory)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('success').equal(false);
					expect(res.body).to.have.property('message').to.be.a('string');
					expect(res.body.results).to.be.an('object').that.has.all.keys('message', 'name', 'stringValue', 'kind', 'value', 'path');
					expect(res.body.results).to.have.property('name').to.be.a('string').equal('CastError');
					expect(res.body.results).to.have.property('kind').to.be.a('string').equal('ObjectId');
					done(err);
				});
		});
	});

	// == testing how to delete a category ==
	describe('DELETE /api/categories/{categoryid}', function() {
		it('remove a category', function(done) {
			Category
				.findOne({})
				.exec(function(err, category) {
					supertest(server)
						.delete(`/api/v1/categories/${category._id}`)
						.set('Authorization', apiKey)
						.expect(204)
						.end(function(err, res) {
							expect(res.body).to.be.an('object');
							done(err);
						});
				});			
		});

		it('returns a message failed to delete a category', function(done) {
			let category = { _id: 1234 };
			supertest(server)
				.delete(`/api/v1/categories/${category._id}`)
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