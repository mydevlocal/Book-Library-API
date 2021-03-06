module.exports = {
	mongodb: {
		dbURL: process.env.MONGODB_URI,
		dbOptions: {
			useMongoClient: true,
			reconnectTries: Number.MAX_VALUE,
			reconnectInterval: 500,
			poolSize: 5,
			bufferMaxEntries: 0,
		},
	},
	jwtSecret: { tokenKey: process.env.JWT_TOKEN },
};
