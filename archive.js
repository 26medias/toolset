var _ 					= require('underscore');
var fs 					= require('fs');
var archiver 			= require('archiver');
var unzip 				= require('unzip');
var file 				= require('./file').main;
var path 				= require('path');
var tar 				= require("tar-fixed");
var fstream 			= require("fstream");

function archive() {
	
}

archive.prototype.compressDirectory = function(directory, filename, callback) {
	
	var output = fs.createWriteStream(filename);
	
	output.on('close', function() {
		callback(filename);
	});
	
	output.on('error', function(err) {
		throw err;
	});
	
	fstream.Reader({ path: directory, type: "Directory" }).pipe(tar.Pack({ noProprietary: true })).pipe(output);
}
archive.prototype.archive = archive.prototype.compressDirectory;

archive.prototype.extract = function(filename, directory, callback) {
	var input = fs.createReadStream(filename);
	
	var tarInstance = tar.Extract({ path: directory });
	
	input.pipe(tarInstance);
	
	tarInstance.on("error", function (err) {
		throw err;
	});
	
	tarInstance.on("end", function () {
		callback();
		console.error("done")
	});
}

exports.main = new archive();