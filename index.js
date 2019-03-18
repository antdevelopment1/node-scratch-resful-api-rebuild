// Primary file for api

// Dependancy
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');

// The server should respond to all request with a string
var server = http.createServer(function(req, res) {

    // Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path from the url
    var path = parsedUrl.pathname; 
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object 
    var headers = req.headers;

    // Get payload if there is any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
   
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        // Choose the handler this request should go to
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler.
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
         };
        // // console.log(chosenHandler)

        // Construct the data object to return to handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        // Route the request specified to the in the router
        chosenHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode == 'number') ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            var payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this payload responce.', statusCode, payloadString);

        })
        
    });

});

// Start the server and have it listen on port 3000
server.listen(config.port, function() {
    console.log("The server is listening on port "+config.port+" in "+config.envName+" node");
});

// Define handlers
var handlers = {};

// Define sample handlers
handlers.sample = function(data, callback) {
    // Callback a http statuscode and a payload object
    callback(406, {'name': 'sample handler'})

};

// Not found handlers 
handlers.notFound = function(data, callback) {
    callback(404);
}

var router = {
    'sample': handlers.sample
};