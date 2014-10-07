var db = require('../config');
var Promise = require('bluebird');
var bcryptOriginal = require('bcrypt-nodejs');
var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

var User = db.Model.extend({
	tableName: 'users',
	hasTimestamps: true,
	initialize: function(){
		this.on('creating', function(model, attrs, options){
			var username = model.get('username').toLowerCase().trim();
			return new User({username: username})
								.fetch()
								.then(function(user){
									console.log(user);
									if(!user){
										var password = model.get('password'); 
										var salt = bcryptOriginal.genSaltSync(10);
										var hash = bcryptOriginal.hashSync(password, salt);
										model.set('password', hash);
									} else {
										model.destroy();
										throw 'this username is taken';
									}
								});
			console.log("MODEL", model);
			});
	}

}, 
{
	signup: Promise.method(function(username, password){
		if(!username || !password){
			throw new Error('username and password are both required');
		};

		new User({ 
			username: username.toLowerCase().trim(),
			password: password
		}).save().then(function(){
			return true;
		});
									
	}),
	login: Promise.method(function(username, password){
		if(!username || !password){
			throw new Error('You need to enter both a username & password');
		}
		return new this({username: username.toLowerCase().trim()})
				.fetch({require: true})
				.tap(function(user){
					return bcrypt.compareAsync(password, user.get('password'));
				});

	}),
	logout: Promise.method(function(session){
		session.destroy();
	})
});


module.exports = User;
