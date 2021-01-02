// Request handlers

// Dependancies
var _data = require('./data');
var helpers = require('./helpers');

// Define handlers
var handlers = {};

handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for the users sub methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data:none
handlers._users.post = function(data, callback) {
    // Check that all required feilds are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? data.payload.tosAgreement == true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesnt already exsist
        _data.read('users', phone, function(err, data) {
            if (err) {
                // Hash the password
                var hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                        // Create the user object
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, function(err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err);
                            callback(400, {'Error': 'Could not create the new user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not hash the user\'s  password'});
                }

            } else {
                // A user with that phone number already exsists
                callback(400, {'Error': 'A user with that phone number already exsists'});
            }
        });
    } else {
        callback(404, {"Error": "Missing required feilds"});
    }
}

// Users - get
// Required data:phone
// Optional data: none
// @TODO Only let an authenticated user acces their object and dont let them access anyone else
handlers._users.get = function(data, callback) {
  
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        // Looking up the user
        _data.read('users', phone, function(err, data) {
            if (!err && data) {
                // Remove the hashed password from the user object before returning it to the requester
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
}

// Users - put
handlers._users.put = function(data, callback) {
    
}

// Users - delete
handlers._users.delete = function(data, callback) {
    
}
 
// Will return a success if everything is running
handlers.ping = function(data, callback) {
    callback(200);
};

handlers.hello = function(data, callback) {
    callback(200, {"message": 'This is the home page.'});
};


// Not found handlers 
handlers.notFound = function(data, callback) {
    callback(404);
};

// Export the module
module.exports = handlers;