var _ 				= require('underscore');
var file 			= require('./file.js').main;

function datacache(options) {
	this.options = _.extend({
		TTL: 	false,
		type:	{}
	}, options);
	
	this.files = {};
	
	this.cache = {};
	
	this.daemon();
}
datacache.prototype.daemon = function() {
	var scope = this;
	clearInterval(this.interval);
	if (this.options.TTL) {
		setInterval(function() {
			var i;
			for (i in scope.cache) {
				if (scope.cache[i].expires <= new Date().getTime()) {
					delete scope.cache[i];
				}
			}
		}, this.options.TTL);
	}
}
datacache.prototype.get = function(type, options, callback) {
	var id = this.options[type].toString(options);
	if (this.cache[id]) {
		callback(this.cache[id].data);
	} else {
		// Get the data
		this.options[type].method(options, function(response) {
			this.cache[id] = {
				expires: 	new Date().getTime+this.options.TTL,
				data:		response
			};
			callback(this.cache[id].data);
		});
	}
}
datacache.prototype.fetch = function(url, callback) {
	var scope = this;
	if (this.files[url]) {
		callback(this.files[url].data);
	} else {
		// Get the data
		file.read(url, function(content){
			scope.files[url] = {
				expires: 	new Date().getTime+scope.options.TTL,
				data:		content
			}
			callback(content);
		});
	}
}

exports.main = datacache;