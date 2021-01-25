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


// @TODO Get rid of this
helpers.sendTwilioSms('4152344567', 'Hello!',function(err) {
  console.log('thiis was the error', err);
})

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
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};


// // this first function is getUserChoice
// function getUserChoice (userString) {
//     // console.log(userString);
//     // get the UserInput and converts to .toLowerCase() 
//     userString = userString.toLowerCase();
//     // console.log(userString);
//     // comparing userInput between available options
//     if (userString === "rock" || userString === "scissors"  || userString === "paper") {
//         return userString ;
//     } else {
//         console.log("invalid response")
//         return "that won't work";
//     }
// }



// // the second function is getComputerChoice

// function getComputerChoice () {
//     // generate random number between 0-2
//     const computerInput = Math.floor(Math.random() * 3);
//     const compSent = "The computer answered was";
//     switch(computerInput) {
//         case 0:
//          text: "rock";
//          return "rock";
//           // code block 
//           break;
//         case 1:
//             text: "paper";
//             return "paper";
//           // code block
//           break;
//         case 2:
//             text: "scissors"
//             return "scissors";
//           // code block
//           break;
//         default: 
//           // code block
//     }
// }
// // console.log(getComputerChoice());

// // the third function determinesWinner

// function determinesWinner(userChoice, compChoice) {
//   if (userChoice === compChoice) {
//     return `The user ansered ${userChoice} and the computer answered ${compChoice}. It was a draw` ;
//   } 
//   if (userChoice === "rock" && compChoice === "scissors") {
//     return `The user ansered ${userChoice} and the computer answered ${compChoice}. You Won`;
//   }
//   if (userChoice === "rock" && compChoice === "paper") {
//     return `The user entered ${userChoice}. The computer entered ${compChoice}. You lost`;
//   }
//   if (userChoice === "paper" && compChoice === "scissors") {
//     return `The user entered ${userChoice}. The computer entered ${compChoice}. You lost`;
//   }
//   if (userChoice === "paper" && compChoice === "rock") {
//     return `The user enttered ${userChoice}. The computer entered ${compChoice}. You won`;
//   }
//   if (userChoice === "scissors" && compChoice === "rock") {
//     return `The user enttered ${userChoice}. The computer entered ${compChoice}. You lost`;
//   }
//   if (userChoice === "scissors" && compChoice === "paper") {
//     return `The user enttered ${userChoice}. The computer entered ${compChoice}. You Won`;
//   }  
// }

// console.log(determinesWinner(getUserChoice(userChoiceValue), getComputerChoice()))


// var userChoiceValue = "paper";


