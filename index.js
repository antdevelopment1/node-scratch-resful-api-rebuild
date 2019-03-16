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

        // Now that the request has finished we want to continue what we were doing before
        // Send the response
        res.end('Hello world\n');

        // Log the requested path
        console.log('Request recieved with this payload:', buffer);
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