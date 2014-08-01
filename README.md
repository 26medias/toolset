# Toolset #
Toolset is a set of utilities that makes it a lot faster and easier to do the things you need all the time in your projects.

It is split into modules.

## Install ##

`npm install toolset`

`var toolset = require('toolset');`

## files ##

### Read non binary files and urls ###
```
// Read a local file
toolset.file.read('file.txt', function(content) {
    // content === false if the file doesn't exist.
});

// Read a remote file (GET)
toolset.file.read('http://www.server.com/file', function(content) {
    // content === false if the server's response code is not 200.
});
```

### Read a JSON file (and get the output as object already) ##
```
// Read a local JSON file
toolset.file.toObject('file.json', function(obj) {
    // content === false if the file doesn't exist.
});

// Read a remote JSON file (GET)
toolset.file.read('http://www.server.com/file.json', function(obj) {
    // content === false if the server's response code is not 200.
});
```


### Read a binary file ##
```
// Read a local file
toolset.file.readBinary('logo.jpg', function(content) {
    // content === false if the file doesn't exist.
});

// Read a remote file (GET)
toolset.file.readBinary('http://www.server.com/logo.jpg', function(content) {
    // content === false if the server's response code is not 200.
});
```


### Append to a file ##
```
toolset.file.append('file.txt', 'some content', function() {
    // done
});
```


### Write/create a file ##
```
toolset.file.write('file.txt', 'some content', function() {
    // done
});
```


### Write/create a JSON object to a file ##
```
toolset.file.writeJson('file.json', {hello:'world'}, function() {
    // done
});
```


### Delete a file ##
```
toolset.file.removeFile('file.json', function() {
    // done
});
```


### Copy a file ##
```
toolset.file.copy('file.txt', 'copy.txt', function() {
    // done
});
```


### Test if a file exists ##
```
toolset.file.exists('file.txt', function(exists) {
    if (exists) {
        // file exists
    } else {
        // fiel doesn't exist
    }
});
```


### List the files in a directory (including subdirectories) ##
```
// List all the JS files
toolset.file.listFiles('/home', 'js', function(files) {
    // ['/home/file.js', '/home/subdirecotry/somefile.js', ...]
});

// List any file
toolset.file.listFiles('/home', false, function(files) {
    // ...
});
```


### List the files with a specific filename (including subdirectories) ##
```
// List any file
toolset.file.listByFilename('./bower_components', 'bower.json', function(files) {
    // ...
});
```


### List the files in a directory (*not* including subdirectories) ##
```
toolset.file.getDirContent('/home', function(files) {
    // ...
});
```


### Test if it's a dir or a file ##
```
var isDir = toolset.file.isDir('something');
```


### Create a path (create all the directories required) ##
```
toolset.file.createPath('/hello/world/test/', function() {
    // ...
});
```



### Delete a directory and its content ##
```
toolset.file.removeDir('/some_directory', function() {
    // ...
});
```


## Stack ##
If you want to get out of the callback nightmare, you'll need to organize your code better. Some people use promises, but I personnaly prefer the stack approach to the issue.

For example, let's say you want to read the files 0.js, 1.js, 2.js ... 9.js and concatenate them in a single file:
```
    // Create a new stack instance
    var stack = new toolset.stack();
    
    // Create a variable to store the files
    var concatenated = "";
    
    for (i=0;i<10;i++) {
        stack.add(function(params, callback) {
            toolset.file.read(params.i+'.js', function(content) {
                concatenated += content;
                
                // We're done processing, we call the callback function to let the stack know we are done with that particular task.
                callback();
            });
        }, {i: i});
    }
    
    // Now that we have the tasks setup, we execute them
    // The callback function in process() will get execute only once all of the tasks are finished.
    stack.process(function() {
        // Write the file
        toolset.file.write('concatenated.js', concatenated);
    }, false);  // false = sync. true = async.
```

## Archiving ##
One need that keeps coming back in many project is the ability to quickly archive and then extract files and folders.

There are barely any package on NPM capable of archiving and then extracting files **and** directories on every OS. Some of those packages corrupt the archive when the files are too large, or there are too many files.

Toolset allows to archive and extract files and directories on every OS in the TAR format, no matter what size your archive is.

```
var toolset     = require('toolset');
var tar         = toolset.archive;

// Archive
tar.archive('./some_directory', 'archive.tar', function() {
    // Archive is created
});

// Extract
tar.extract('archive.tar', './extracted_directory', function() {
    // Archive was extracted
});
```



## MongoDB ##
Toolset includes a library built on top of the native MongoDB driver, meant to make querying much faster and easier than by using the native driver, while have a lot more flexibility compared to schema-based library like Mongoose.

### Init ###
```
// Init with options
var toolset     = require('toolset');
var mongoDB     = toolset.mongo;
var mongo       = new mongoDB({
    database:   'database name',    // optionnal. default: 'test'
    host:       '127.0.0.1',        // optionnal. default: '127.0.0.1'
    port:       27017,              // optionnal. default: 27017
    login:      '',                 // optionnal. default: no authentication
    password:   ''                  // optionnal. default: no authentication
});
```

```
// Quick init
var mongoDB     = require('toolset').mongo;
var mongo       = new mongoDB({database: 'test'});
```

### Find ###
Search for documents
```
// With options
mongo.find({
    collection:     'users',    // Required
    query:          {           // Optionnal. default: {}
        ...
    },
    fields:          {          // Optionnal. default: {}
        name:   true,
        _id:    false
    },
    sort:           {           // Optionnal. default: false
        id:     1
    },
    limit:          5,          // Optionnal. default: false
    skip:           5           // Optionnal. default: false
}, function(responses) {

});
```

```
// Without options
mongo.find({
    collection:     'users',
    query:          {
        id: {
            $in:    [123,456,789]
        }
    }
}, function(responses) {

});
```

Option | Description
:-----------|:------------
 collection |   Collection name
 query |        MongoDB Query
 fields |       List of fields/properties to return. true = return, false = don't return.
 sort |         Sort options
 limit  |       How many documents to return
 skip |         How many documents to skip
 
#### Pagination ####
You can paginate your documents using the paginate() method, which will return the documents and the info about the number of documents, number of pages, what page is currently displayed.

```
mongo.paginate({
    collection:     'users',
    query:          {},
    perpage:        20,     // 20 documents per page
    page:           2       // Show the 2nd page
}, function(pagination_data) {
   /*
   pagination_data looks like this:
    {
        "pagination": {
            "perpage": 20,
            "total": 7102,
            "pages": 356,
            "current": 2
        },
        "data": [
           ...
        ]
    }
   */ 
});
```

paginate() accepts the same options as find(), like sort, fields, ...

### Insert ###
Insert one or more documents.

```
// Insert one document
mongo.insert({
    collection:     'users',
    query:          {
        id:     123456,
        email:  'test@test.com'
    }
}, function(err, inserted) {
    
});
```

```
// Insert many documents
mongo.insert({
    collection:     'users',
    query:          [{
        id:     123456,
        email:  'test@test.com'
    },{
        id:     7894561,
        email:  'test2@test.com'
    }]
}, function(err, inserted) {
    
});
```


### Update ###
Update data

```
mongo.update({
    collection:     'users',
    query:          {
        id:     123456
    }, data:        {
        $set:   {
            email:  'test3@test.com'
        }
    },
    options:        {        // optionnal.
        upsert:     false,   // default: true
        multi:      false    // default: true
    }
}, function(err) {
    
});
```

### Remove ###
Remove data

```
mongo.remove({
    collection:     'users',
    query:          {
        id:     123456
    }
}, function(err) {
    
});
```

### Count ###
count data

```
mongo.count({
    collection:     'users',
    query:          {
        id:     123456
    }
}, function(count) {
    // count is a number
});
```
### Distinct ###
Get a list of distinctive values from a specific field. Returns an array.

```
mongo.distinct({
    collection:     'users',
    query:          {},
    key:            'email'
}, function(emails) {
    // emails is an array containing all the distinct emails for that query
});
```

### Aggregate ###
Perform an aggregation.

```
mongo.aggregate({
    collection:     'users',
    rules:         [{
		$match:	{
			// Query
		}
	},{
		$group:	{
			_id:	"referrer",
			total:	{
				$sum: 1
			}
		}
	}]
}, function(aggregated_data) {
    
});
```
