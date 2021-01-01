// Create an export configuration files

// Container for all enviornments
var enviornments = {};

// Staging default enivornment
enviornments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret'
};

// Production object
enviornments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsASecret'
};

// Determine which environment was pass as a command line argurment
var currentEnv = typeof(process.env.NODE_ENV)== 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current enviornment is one of the enviornments above, if not default to staging
var enviornmentToExport = typeof(enviornments[currentEnv]) === 'object' ? enviornments[currentEnv] : enviornments.staging;

// Export the module
module.exports = enviornmentToExport;