 var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8080;

var str = "";
var val = "";

var SerialPort = require("serialport").SerialPort;
var serialport = new SerialPort("/dev/tty.usbmodemfa131");

serialport.on('open', function(){
  console.log('Serial Port Opend');
  serialport.on('data', function(data){
      str += data.toString('utf-8');
      if(str.indexOf("\n") > -1){
      	console.log(str);
      	val = str.trim();
      	str = "";
      	if(val == ""){
			console.log("ERROR, No data.");
      	}
      }
  });
});

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname
	, filename = path.join(process.cwd(), uri)
	, url_parts = url.parse(request.url, true)
	, query = url_parts.query;
	
	console.log(query);
		
	if(typeof query.getData != 'undefined'){
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(val);
		response.end();
		return;	
	}
	
	path.exists(filename, function(exists) {
	if(!exists) {
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not Found\n");
		response.end();
		return;
	}
	
	if (fs.statSync(filename).isDirectory()) filename += '/index.html';
	
	fs.readFile(filename, "binary", function(err, file) {
	  if(err) {        
	    response.writeHead(500, {"Content-Type": "text/plain"});
	    response.write(err + "\n");
	    response.end();
	    return;
	  }
	
	  response.writeHead(200, {'Content-Type': 'text/html'});
	  response.write(file, "binary");
	  response.end();
	});
	});
}).listen(parseInt(port, 10));