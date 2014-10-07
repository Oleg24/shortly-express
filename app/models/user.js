var db = require('../config');
var Promise = require('bluebird');
var bcryptOriginal = require('bcrypt-nodejs');
var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

var User = db.Model.extend({
	tableName: 'users',
	hasTimestamps: true,
	initialize: function(){
		// this.on('creating', function(model, attrs, options){
		// 	var 
		// })
	}

}, 
{
	signup: Promise.method(function(username, password){
		if(!username || !password){
			throw new Error('username and password are both required');
		};
		return new this({username: username.toLowerCase().trim()})
								.fetch()
								.then(function(user){
									if(!user || !user.length){
										var salt = bcryptOriginal.genSaltSync(10);
										var hash = bcryptOriginal.hashSync(password, salt);
										new User({ 
											username: username.toLowerCase().trim(),
											password: hash
										}).save().then(function(){
											return true;
										});
									} else {
										throw new Error('this username is taken');
									}

								})
	}),
	login: Promise.method(function(username, password){
		if(!username || !password){
			throw new Error('You need to enter both a username & password');
		}
		return new this({username: username.toLowerCase().trim()})
				.fetch({require: true})
				.tap(function(user){
					console.log('password', user.get('password'));
					console.log('user', user); 
					return bcrypt.compare(password, user.get('password'));
				});

	})
});


module.exports = User;
