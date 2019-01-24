// Primary file for api

// Dependancy
var http = require('http');
var url = require('url');

// The server should respond to all request with a string
var server = http.createServer(function(req, res) {

    // Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path from the url
    var path = parsedUrl.pathname; 
    var trimmedPath = path.replace(/^\+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get HTTP method
    var method = req.method.toLowerCase();

    // Send the response
    res.end('Hello world\n');

    // Log the requested path
    console.log('Request recieved on this path:' + trimmedPath + ' with method: ' + method + ' and with these query string parameters', queryStringObject);

});

// Start the server and have it listen on port 3000
server.listen(3000, function() {
    console.log('The server is listening on port 3000');
});