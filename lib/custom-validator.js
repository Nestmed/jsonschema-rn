'use strict';

var Validator = require('./validator');
var helpers = require('./helpers');
var ValidatorResult = helpers.ValidatorResult;

/**
 * Creates a custom validator that extends the default validator with the following behaviors:
 * 1. Ignore null values in validation (consider null valid for any type)
 * 2. Allow null values for enum properties
 * 3. Skip validation for properties that are null or missing
 * 4. Validate additionalProperties properly for null instances
 * 
 * This follows the Python implementation from the user's requirements
 */
function extendWithNullableSupport() {
  // Create a new validator instance
  var customValidator = new Validator();
  
  // Store the original validate methods
  var originalValidateType = customValidator.attributes.type;
  var originalValidateEnum = customValidator.attributes.enum;
  var originalValidateProperties = customValidator.attributes.properties;
  var originalValidateAdditionalProperties = customValidator.attributes.additionalProperties;

  // Override type validation to ignore null values
  customValidator.attributes.type = function(instance, schema, options, ctx) {
    // Allow null for any type
    if (instance === null || instance === undefined) {
      return null;
    }
    return originalValidateType.call(this, instance, schema, options, ctx);
  };

  // Override enum validation to allow null values
  customValidator.attributes.enum = function(instance, schema, options, ctx) {
    // Allow null for any enum property
    if (instance === null || instance === undefined) {
      return null;
    }
    return originalValidateEnum.call(this, instance, schema, options, ctx);
  };

  // Override properties validation to skip validation for null or missing properties
  customValidator.attributes.properties = function(instance, schema, options, ctx) {
    // Skip validation if instance is null or undefined
    if (instance === null || instance === undefined) {
      return null;
    }
    
    var result = new ValidatorResult(instance, schema, options, ctx);
    var properties = schema.properties || {};
    
    for (var property in properties) {
      if (instance[property] === null || instance[property] === undefined) {
        // Skip validation for null or missing properties
        continue;
      }
      
      var prop = properties[property];
      var res = this.validateSchema(instance[property], prop, options, ctx.makeChild(prop, property));
      if(res.errors.length) {
        result.addError({
          name: 'properties',
          argument: property,
          message: "property " + property + " is invalid"
        });
      }
      result.importErrors(res);
    }
    
    return result;
  };

  // Override additionalProperties validation to handle null instances
  customValidator.attributes.additionalProperties = function(instance, schema, options, ctx) {
    // Skip validation if instance is null or undefined
    if (instance === null || instance === undefined) {
      return null;
    }
    
    // If additionalProperties is not explicitly false, allow additional properties
    if (schema.additionalProperties !== false) {
      return null;
    }
    
    var result = new ValidatorResult(instance, schema, options, ctx);
    var properties = schema.properties || {};
    var patternProperties = schema.patternProperties || {};
    
    for (var property in instance) {
      // Skip properties defined in the schema
      if (properties[property] !== undefined) {
        continue;
      }
      
      // Skip properties matching pattern properties
      var matched = false;
      for (var pattern in patternProperties) {
        var regex = new RegExp(pattern);
        if (regex.test(property)) {
          matched = true;
          break;
        }
      }
      if (matched) {
        continue;
      }
      
      // If we get here, it's an additional property that's not allowed
      result.addError({
        name: 'additionalProperties',
        argument: property,
        message: "additional property '" + property + "' is not allowed"
      });
    }
    
    return result;
  };

  return customValidator;
}

/**
 * Creates a custom validator with nullable support
 */
var CustomValidator = extendWithNullableSupport();

/**
 * Validates an instance against a schema using the custom validator
 * @param {any} instance - The instance to validate
 * @param {object} schema - The schema to validate against
 * @param {object} [options] - Options for validation
 * @returns {ValidatorResult} The validation result
 */
function customValidate(instance, schema, options) {
  return CustomValidator.validate(instance, schema, options);
}

module.exports = {
  CustomValidator: CustomValidator,
  customValidate: customValidate
}; 