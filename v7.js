var fs = require('fs');
var http = require('http');
var url = require('url');
var readline = require('readline');
var ROOT_DIR = 'html';

http.createServer(function (req, res){
	var urlObj = url.parse(req.url, true, false);
	//if this is our comments REST service
	if(urlObj.pathname === "/comment") {
  		console.log("comment route");

   	 	if(req.method === "POST") {
   	  		console.log("POST comment route");
   	  		// First read the form data
			var jsonData = "";
			req.on('data', function (chunk) {
				jsonData += chunk;
			});
			req.on('end', function () {
				var reqObj = JSON.parse(jsonData);
				console.log(reqObj);
				console.log("Name: "+reqObj.Name);
				console.log("Comment: "+reqObj.Comment);
				res.writeHead(200);
				res.end("");
				// Now put it into the database
				var MongoClient = require('mongodb').MongoClient;
				MongoClient.connect("mongodb://localhost/weather", function(err, db) {
					if(err) throw err;
					db.collection('comment').insert(reqObj,function(err, records) {
					  console.log("Record added as "+records[0]._id);
					});
				});
				
			});
  		}
  		// Add a CRUD route for Read  on GET
  		else if(req.method === "GET") {
      		console.log("In GET"); 
      		// Read all of the database entries and return them in a JSON array
			var MongoClient = require('mongodb').MongoClient;
			MongoClient.connect("mongodb://localhost/weather", function(err, db) {
				if(err) throw err;
				db.collection("comment", function(err, comments){
					if(err) throw err;
					comments.find(function(err, items){
				    	items.toArray(function(err, itemArr){
					    	console.log("Document Array: ");
					    	console.log(itemArr);
					    	res.writeHead(200);
							res.end(JSON.stringify(itemArr));
					    });
				 	});
				});
			});
   		}
  	}
	
	else if(urlObj.pathname === "/getcity"){
		fs.readFile('cities.dat.txt', function (err,data){
			if(err) throw err;
			console.log("In get city function");
			var cities = data.toString().split('\n');
			var myRegEx = RegExp('^'+urlObj.query['q']);
			var jsonresult = []
			for(var i = 0; i < cities.length; i++){
				var result = cities[i].search(myRegEx);
				if(result != -1){
					console.log(cities[i]);
					jsonresult.push({city: cities[i]});
				}
			}
			console.log(JSON.stringify(jsonresult));
			res.writeHead(200);
			res.end(JSON.stringify(jsonresult));
		});
	}
	else{
		console.log("YO");
		fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data){ 
			if (err) {
				res.writeHead(404);
				res.end(JSON.stringify(err));
				return;
			}
			res.writeHead(200);
			res.end(data);
		});
	}
}).listen(80);
