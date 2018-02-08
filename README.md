# Book Library API

> Stateless RESTful API (NodeJS/Express, JWT, MongoDB), testing with (Mocha, Chai, Supertest) & include the API Docs powered by [Docbox](https://github.com/tmcw/docbox "Docbox Homepage").

[![Build Status](https://travis-ci.org/nubilfi/Book-Library-API.svg?branch=master)](https://travis-ci.org/nubilfi/Book-Library-API)
[![Coverage Status](https://david-dm.org/nubilfi/Book-Library-API.svg)](https://coveralls.io/r/nubilfi/Book-Library-API?branch=master)

I created this app from scratch and maybe this app is not perfect for you (of couse this app isn't perfect :blush:).

## Installation

Download or clone this repo, then run the following command:

```sh
npm install
```

## Usage example

Before you can run this app, make sure you've set `env variable` on your machine. For me, i use linux so i can create it directly in my terminal:

```sh
export HOST=localhost
export PORT=3245
export MONGODB_URI=mongodb://localhost:27017/db_example
export JWT_TOKEN=myrandomtoken01234
```

Note, those variable is available **ONLY** in current active terminal, so you **MUST** run the app in the same terminal, use the following command to run the app:

```sh
sudo systemctl start mongodb (just to make sure to start your mongodb)
npm start
npm test  (if you want to run test)
```

If you want to make those variable permanent, edit your `.bashrc` file.

Make sure there's no error output when you run it, then you can access it in your browser to see the available endpoint in the API Docs.

```
http://localhost:3245/
```

## Feedback

So guys, if you don't mind to help me, you can give me an advice to make my code better.

1. Fork it (<https://github.com/nubilfi/Book-Library-API.git/fork>)
2. Create your feature branch (`git checkout -b feature/BestPractice`)
3. Commit your changes (`git commit -am 'Add some BestPractice'`)
4. Push to the branch (`git push origin feature/BestPractice`)
5. Create a new Pull Request