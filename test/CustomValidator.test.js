'use strict';

var assert = require('assert');
var { customValidate } = require('../lib/custom-validator');

// Sample schema for various test cases
var schema = {
  "type": "object",
  "properties": {
    "Sodium": {
      "type": "integer",
      "description": "Sodium level in mg."
    },
    "Carbohydrate": {
      "type": "string",
      "enum": ["Low", "High"]
    },
    "FluidRestriction": {
      "type": "integer",
      "description": "Fluid restriction in cc/24 hours."
    },
    "Diet": {
      "type": "object",
      "properties": {
        "HighProtein": {
          "type": "integer"
        },
        "LowProtein": {
          "type": "integer"
        },
        "DietType": {
          "type": "string",
          "enum": ["Vegetarian", "Non-Vegetarian", "Vegan"]
        }
      },
      "additionalProperties": false
    }
  },
  "required": ["Sodium"],
  "additionalProperties": false
};

describe('CustomValidator', function() {
  
  it('should validate valid instance', function() {
    var instance = {
      "Sodium": 140,
      "Carbohydrate": "Low",
      "FluidRestriction": 1500,
      "Diet": {
        "HighProtein": 100,
        "DietType": "Vegan"
      }
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Valid instance should pass validation");
  });

  it('should reject missing required property', function() {
    var instance = {
      "Carbohydrate": "Low",
      "FluidRestriction": 1500
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, false, "Instance missing required property should fail validation");
  });

  it('should allow null for enum property', function() {
    var instance = {
      "Sodium": 140,
      "Carbohydrate": null // Enum property is null
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Null value for enum property should be valid");
  });

  it('should reject invalid enum value', function() {
    var instance = {
      "Sodium": 140,
      "Carbohydrate": "Medium" // Not in the enum
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, false, "Invalid enum value should fail validation");
  });

  it('should allow null for enum subproperty', function() {
    var instance = {
      "Sodium": 140,
      "Diet": {
        "DietType": null // Enum subproperty is null
      }
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Null value for enum subproperty should be valid");
  });

  it('should reject invalid enum subproperty', function() {
    var instance = {
      "Sodium": 140,
      "Diet": {
        "DietType": "Keto" // Not in the enum for DietType
      }
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, false, "Invalid enum subproperty should fail validation");
  });

  it('should allow null values for any property', function() {
    var instance = {
      "Sodium": 140,
      "Carbohydrate": null
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Null values should be valid for any property");
  });

  it('should reject additional properties', function() {
    var instance = {
      "Sodium": 140,
      "Carbohydrate": "Low",
      "ExtraField": "NotAllowed" // Extra field not in the schema
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, false, "Additional properties should fail validation");
  });

  it('should allow missing non-required fields', function() {
    var instance = {
      "Sodium": 140 // Only the required field is present
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Missing non-required fields should be valid");
  });

  it('should allow null as the entire instance', function() {
    var instance = null;
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Null instance should be valid");
  });

  it('should reject additional properties in nested objects', function() {
    var nested_schema = {
      "type": "object",
      "properties": {
        "Diet": {
          "type": "object",
          "properties": {
            "Sodium": {"type": "integer"},
            "FluidRestriction": {"type": "integer"}
          },
          "additionalProperties": false
        }
      }
    };

    var valid_instance = {
      "Diet": {
        "Sodium": 140,
        "FluidRestriction": 1500
      }
    };

    var invalid_instance = {
      "Diet": {
        "Sodium": 140,
        "ExtraField": "NotAllowed" // Additional field in nested object
      }
    };
    
    var valid_result = customValidate(valid_instance, nested_schema);
    var invalid_result = customValidate(invalid_instance, nested_schema);
    
    assert.equal(valid_result.valid, true, "Valid nested objects should pass validation");
    assert.equal(invalid_result.valid, false, "Additional properties in nested objects should fail validation");
  });

  it('should allow null for nested objects', function() {
    var instance = {
      "Sodium": 140,
      "Diet": null // Should be valid since Diet is not required
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Null for nested objects should be valid");
  });

  it('should allow missing nested objects', function() {
    var instance = {
      "Sodium": 140 // Diet object is missing but should be valid
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Missing nested objects should be valid");
  });

  it('should allow excluding any non-required field', function() {
    var instance = {
      "Sodium": 140 // Only the required field is present
    };
    
    var result = customValidate(instance, schema);
    assert.equal(result.valid, true, "Excluding any non-required field should be valid");
  });

  it('should allow missing or null enum fields', function() {
    var instance_missing = {
      "Sodium": 140 // Carbohydrate is missing
    };
    
    var instance_null = {
      "Sodium": 140,
      "Carbohydrate": null // Carbohydrate is explicitly null
    };
    
    var result_missing = customValidate(instance_missing, schema);
    var result_null = customValidate(instance_null, schema);
    
    assert.equal(result_missing.valid, true, "Missing enum fields should be valid");
    assert.equal(result_null.valid, true, "Null enum fields should be valid");
  });
}); 