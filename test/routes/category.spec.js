/* global describe, it, before, after,
mockgoose, mongoose, jwt, opts, supertest, server,
expect, Category */

// == run testing for category routes ==
describe('# Testing Category Routes', () => {
	// == This function will run before test to clear category collection ==
	let apiKey = null;
	before((done) => {
		mockgoose.prepareStorage().then(() => {
			mongoose.connect(opts.mongodb.dbURL, opts.mongodb.dbOptions);
			mongoose.Promise = global.Promise;
			const db = mongoose.connection;
			db.on('error', (err) => { done(err); });
		});

		// == empty the category collection ==
		Category.remove({}).exec();

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

	// == In this test it's expected a category list ==
	describe('GET /api/v1/categories', () => {
		before((done) => {
			// == save temporary category ==
			Category
				.count({})
				.then((count) => {
					if (count === 0) {
						const category = new Category({
							category_name: 'Romance',
						});
						category.save();
					}
				}).catch((err) => { done(err); });
			done();
		});

		it('returns a list of categories', (done) => {
			supertest(server)
				.get('/api/v1/categories')
				.set('Authorization', apiKey)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
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
	describe('GET /api/v1/categories/{categoryid}', () => {
		it('returns a spesific category id', (done) => {
			// == create a fake category ==
			const category = new Category({
				category_name: 'Comedy',
			});

			category
				.save((err, data) => {
					supertest(server)
						.get(`/api/v1/categories/${data._id}`) /* eslint no-underscore-dangle: 0 */
						.set('Authorization', apiKey)
						.expect('Content-Type', /json/)
						.expect(200)
						.end((error, res) => {
							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).that.has.all.keys('__v', '_id', 'category_name', 'createdAt', 'updatedAt');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('category_name').to.be.a('string');
							done(error);
						});
				});
		});

		// == testing for category not found ==
		it('returns a message categoryid not found', (done) => {
			const fakeCategory = { _id: '1234' };

			supertest(server)
				.get(`/api/v1/categories/${fakeCategory._id}`)
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

	// == Testing the save category expecting status 201 of success ==
	describe('POST /api/v1/categories', () => {
		it('saves a new category', (done) => {
			const newCategory = {
				category_name: 'Fiction',
			};

			supertest(server)
				.post('/api/v1/categories')
				.set('Authorization', apiKey)
				.send(newCategory)
				.expect('Content-Type', /json/)
				.expect(201)
				.end((err, res) => {
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
		it('returns a message failed to save category data', (done) => {
			const fakeCategory = {
				category_names: 'Literature',
			};

			supertest(server)
				.post('/api/v1/categories')
				.set('Authorization', apiKey)
				.send(fakeCategory)
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

	// == testing how to update a category ==
	describe('PUT /api/v1/categories{categoryid}', () => {
		it('update a category', (done) => {
			const updateCategory = {
				category_name: 'Sci-Fi',
			};

			Category
				.findOne({})
				.exec((err, category) => {
					supertest(server)
						.put(`/api/v1/categories/${category._id}`)
						.set('Authorization', apiKey)
						.send({ ...updateCategory, id: category._id })
						.expect('Content-Type', /json/)
						.expect(200)
						.end((error, res) => {
							expect(res.body).to.be.an('object');
							expect(res.body).to.have.property('success').equal(true);
							expect(res.body).to.have.property('message').to.be.a('string');
							expect(res.body.results).to.be.an('object').that.has.all.keys('_id', 'category_name');
							expect(res.body.results).to.have.property('_id').to.be.a('string').to.have.lengthOf(24);
							expect(res.body.results).to.have.property('category_name').to.be.a('string');
							done(error);
						});
				});
		});

		// == testing for failed to update a category ==
		it('returns a message failed to update category data', (done) => {
			const fakeCategory = {
				category_name: 'Mistery',
				_id: 1234,
			};

			supertest(server)
				.put(`/api/v1/categories/${fakeCategory._id}`)
				.set('Authorization', apiKey)
				.send(fakeCategory)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
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
	describe('DELETE /api/categories/{categoryid}', () => {
		it('remove a category', (done) => {
			Category
				.findOne({})
				.exec((err, category) => {
					supertest(server)
						.delete(`/api/v1/categories/${category._id}`)
						.set('Authorization', apiKey)
						.expect(204)
						.end((error, res) => {
							expect(res.body).to.be.an('object');
							done(error);
						});
				});
		});

		it('returns a message failed to delete a category', (done) => {
			const category = { _id: 1234 };
			supertest(server)
				.delete(`/api/v1/categories/${category._id}`)
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
