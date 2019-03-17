// Primary file for api

// Dependancy
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

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
    // As the data streams in every time it streams in a little piece, the request object emits the data event that we are binding to
    // and it sends us a bunch of undecoded data. Since we know it should be utf-8, we decode it to utf-8 using the new utf-8 decoder
    // object that we created and saved to decoder. We build the value up and appened the incoming values to our buffer variable
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
            // res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this payload responce.', statusCode, payloadString);

        })
        
    });
    // Since every request will not have a payload that doesn't mean that our end function won't be called
    // The end event will always be called but the data event will not always be called. If there is no payload
    // the buffer will be initialized into an empty string, and it will never have anything appened to it
    //  However end will still be called and then we will just send that response

});

// Start the server and have it listen on port 3000
server.listen(3000, function() {
    console.log('The server is listening on port 3000');
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