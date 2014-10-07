var db = require('../config');
var Promise = require('bluebird');
var bcryptOriginal = require('bcrypt-nodejs');
var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

var User = db.Model.extend({
	tableName: 'users',
	hasTimestamps: true,
	initialize: function(){

	}

},
{
	signup: Promise.method(function(username, password){
		if(!username || !password){
			throw new Error('username and password are both required');
		};
		return new User({username: username.toLowerCase().trim()})
								.fetch()
								.then(function(user){
									if(!user){
										bcrypt.genSalt(10, function(err, salt){
											bcrypt.hash(password, salt, null, function(err, hash){
												new User({
													username: username.toLowerCase().trim(),
													password: hash
												}).save().then(function(){
													return Promise.resolve(true);
												});
											});
										});
									} else {
										return Promise.reject('username is taken');
									}
								});


	}),
	login: Promise.method(function(username, password){
		if(!username || !password){
			throw new Error('You need to enter both a username & password');
		}
		return new User({username: username.toLowerCase().trim()})
				.fetch({require: true})
				.then(function(user){
					return bcrypt.compareAsync(password, user.get('password')).then(function(res){
						return Promise.resolve(res);
					});
				});

	}),
	logout: Promise.method(function(session){
		session.destroy();
	})
});


module.exports = User;
