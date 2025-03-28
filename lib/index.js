'use strict';

var Validator = module.exports.Validator = require('./validator');
var customValidator = require('./custom-validator');

module.exports.CustomValidator = customValidator.CustomValidator;
module.exports.ValidatorResult = require('./helpers').ValidatorResult;
module.exports.ValidatorResultError = require('./helpers').ValidatorResultError;
module.exports.ValidationError = require('./helpers').ValidationError;
module.exports.SchemaError = require('./helpers').SchemaError;
module.exports.SchemaScanResult = require('./scan').SchemaScanResult;
module.exports.scan = require('./scan').scan;

// Replace the standard validate function with our custom validate function
module.exports.validate = customValidator.customValidate;

// Keep the original validate function available if needed
module.exports.standardValidate = function (instance, schema, options) {
  var v = new Validator();
  return v.validate(instance, schema, options);
};
