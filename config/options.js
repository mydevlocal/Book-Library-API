module.exports = {
	mongodb: {
		dbURL: 'mongodb://localhost:27017/dev-restapi',
		dbOptions: {
			useMongoClient: true,
			reconnectTries: Number.MAX_VALUE,
			reconnectInterval: 500,
			poolSize: 5,
			bufferMaxEntries: 0
		}
	},
	jwtSecret: { tokenKey: 'lkd(*#jLASE340KADl@(nlkSF09aJs' }
};