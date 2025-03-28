'use strict';

// Load the library
var jsonSchema = require('../lib/index.js');

// Define a schema
var schema = {
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "status": { "type": "string", "enum": ["active", "inactive", "pending"] },
    "age": { "type": "integer" },
    "profile": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "level": { "type": "string", "enum": ["beginner", "intermediate", "expert"] }
      },
      "additionalProperties": false
    }
  },
  "required": ["name"],
  "additionalProperties": false
};

// Test instances
var validInstance = {
  "name": "John",
  "status": "active",
  "age": 30,
  "profile": {
    "title": "Developer",
    "level": "expert"
  }
};

var nullableInstance = {
  "name": "John",
  "status": null,  // null enum
  "age": null,     // null integer
  "profile": null  // null object
};

var missingPropertiesInstance = {
  "name": "John"
  // All other properties are missing
};

var additionalPropertiesInstance = {
  "name": "John",
  "extra": "not allowed"
};

var nestedAdditionalPropertiesInstance = {
  "name": "John",
  "profile": {
    "title": "Developer",
    "extra": "not allowed"
  }
};

var nullInstance = null;

// Run validation tests
console.log('Regular validation with standard data:');
console.log(jsonSchema.validate(validInstance, schema).valid);

console.log('\nValidation with null values for properties:');
console.log(jsonSchema.validate(nullableInstance, schema).valid);

console.log('\nValidation with missing properties:');
console.log(jsonSchema.validate(missingPropertiesInstance, schema).valid);

console.log('\nValidation with additional properties (should fail):');
console.log(jsonSchema.validate(additionalPropertiesInstance, schema).valid);

console.log('\nValidation with nested additional properties (should fail):');
console.log(jsonSchema.validate(nestedAdditionalPropertiesInstance, schema).valid);

console.log('\nValidation with null instance:');
console.log(jsonSchema.validate(nullInstance, schema).valid);

// Now compare with standard validation
console.log('\nCompare with standard validation for nullable instance:');
console.log('Custom validation:');
console.log(jsonSchema.validate(nullableInstance, schema).valid);
console.log('Standard validation:');
console.log(jsonSchema.standardValidate(nullableInstance, schema).valid); 