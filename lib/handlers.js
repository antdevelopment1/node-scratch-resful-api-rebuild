// Request handlers

// Dependancies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

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
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
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
                callback(403, {'Error': 'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
}

// Users - put
// Required data:phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user update their own object. Don't let them update anyone else's userObject
handlers._users.put = function(data, callback) {
    // Check for the required field
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // // Check for optional feilds
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone)  {
        // If nothing is sent to update
        if (firstName || lastName || password) {

            // // Ge the token from the headers
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
                if (tokenIsValid) {
                    // Lookup the user
                    _data.read('users', phone, function(err, userData) {
                        if (!err && userData) {
                            // Update the fields nessecary
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName;
                            }
                            if (password) {
                                userData.hashedPassword = helpers.hash(password);
                            }

                            // Store the new updated
                            _data.update('users', phone, userData, function(err) {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {'Error': 'Could not update the user'});
                                }
                            });
                        } else {
                            callback(400, {'Error': 'The specified user does not exsist'});
                        }
                    });
                } else {
                    callback(403, {'Error': 'Missing required token in header, or token is invalid'})
                }
            });

        } else {
            callback(400, {'Error': 'Missing the fields to  update'});
        }

    } else {
        callback(400, {'Error': 'Missing required field'});
    }
}

// Users - delete
// @TODO Only let an authenticated user delete thier object. Dont let them delete anyone else
// @TODO Cleanup delete any other data files associated with this user
handlers._users.delete = function(data, callback) {
    // Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {

        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
     
            if (tokenIsValid) {
                // Looking up the user
                _data.read('users', phone, function(err, data) {
                    if (!err && data) {
                        _data.delete('users', phone, function(err) {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {'Error': 'Could not delete specified user'});
                            }
                        });
                    } else {
                        callback(400, {'Error': 'Could not find the specified user'});
                    }
                });
            } else {
                callback(403, {'Error': 'Missing required token in header, or token is invalid'})
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    } 
}

handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data, callback) {
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (phone && password) {
        // Lookupthe user who matches that phone number
        _data.read('users', phone, function(err, userData) {
            if (!err && userData) {
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // If valid create a new token with a random name. Set expiration date 1 hour in the future
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };
                    // Stores the token
                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error': 'Could not create new tokens'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'Password did not match the specified users stored password'});
                }
            } else {
                callback(400, {'Error': 'Could not find specified user'});
            }
        })

    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
}

// TOKENS GET
// Required data : id
// Optional data: none
handlers._tokens.get = function(data, callback) {
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Looking up the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
}

// Tokens - put
// Required data : id, extend
// Optional data is null
handlers._tokens.put = function(data, callback) {
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                // Check to make sure the token isnt already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Stores the new updates
                    _data.update('tokens', id, tokenData, function(err) {
                        if(!err) {
                            callback(200);
                        } else {callback(500), {'Error': 'Could not update the tokens expiration'}};
                    })
                } else {
                    callback(400, {'Error': 'The token has already expired, and cannot be extended'});
                }
            } else {
                callback(400, {'Error': 'Specified token does not exsist'});
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields or fields are invalid'});
    }
};


handlers._tokens.delete = function(data, callback) {
    // Check that the phone number is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Looking up the token
        _data.read('tokens', id, function(err, data) {
            if (!err && data) {
                _data.delete('tokens', id, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete specified token'});
                    }
                });
            } else {
                callback(400, {'Error': 'Could not find the specified token'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    } 
};

// Verify if a current token id is valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
    _data.read('tokens', id, function(err, tokenData) {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Checks
handlers.checks = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for all the checks methods
handlers._checks = {};

// Checks - post
// Required data: protocol, url, method, successCodes, timeoutSeconds, 
// Optional data: none
handlers._checks.post = function(data, callback) {
    
    var protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array  && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds > 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // Get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData) {

            if (!err && tokenData) {
                var userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, function(err, userData) {
                    if (!err && userData) {
                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        // Verify that the user has less than the number of max checks per user
                        if (userChecks.length < config.maxChecks) {
                            // Create a random id for the check
                            var checksId = helpers.createRandomString(20);

                            // Create the check object and include the users phone
                            var checkObject = {
                                'id': checksId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            };

                            // Save the object
                            _data.create('checks', checksId, checkObject, function(err) {
                                // console.log(checksId, checkObject, 'this is the stuff')
                                if (!err) {
                                    // Add the check id to the user's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checksId);
                                    // Save the new user data
                                    _data.update('users', userPhone, userData, function(err) {
                                        // console.log(userPhone, userData, 'This isthe data')
                                        if (!err) {
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, {'Error': 'Could not update the user with the new check'});
                                        }
                                    });
                                } else {
                                    callback(500, {'Error': 'Could not create the new check'});
                                }
                            })
                        } else {
                            callback(400, {'Error': 'The user already has the max number of checks (' +config.maxChecks+ ')'});
                        }
                    } else {
                        callback(403, {'Error': 'Determine the difference between this 403 and the one below'});
                    }
                })
            } else {
                callback(403);
            }
        })
    } else {
        callback(400, {'Error': 'Missing required inputs or inputs are invalid'});
    }
}

// Checks - post
// Required data : id
// Optional data : none
handlers._checks.get = function(data, callback) {
    // Check that id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the check
        _data.read('checks', id, function(err, checkData) {
            if (!err && checkData) {
                var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                // Verify that the given token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    console.log(token, checkData.uerPhone, tokenIsValid, 'This is the data');
                    if (tokenIsValid) {
                        // Return the check data
                        callback(200, checkData)
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(404)
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
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