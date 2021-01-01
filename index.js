// Primary file for api

// Dependancy
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var _data = require('./lib/data');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

// // Testing
// // @TODO delete this
// _data.delete('test', 'newFile', function(err) {
//     console.log('this was the error',err);
// })

// Instantiating the http server
var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// Start the server and have it listen on port 3000
httpServer.listen(config.httpPort, function() {
    console.log("The server is listening on port "+config.httpPort);
});

var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    "cert": fs.readFileSync('./https/cert.pem')
};

// Instantiating the https server
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req,res);
});

// Start the https server
httpsServer.listen(config.httpsPort, function() {
    console.log("The server is listening on port "+config.httpsPort);
})

// Create a functionthat handles all server logic
var unifiedServer = function(req, res) {
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
            'payload': helpers.parseJsonToObject(buffer)
         };

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
}

var router = {
    'ping': handlers.ping,
    'users': handlers.users
};