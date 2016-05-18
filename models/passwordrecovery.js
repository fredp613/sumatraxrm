'use strict';
module.exports = function(sequelize, DataTypes) {
  var PasswordRecovery = sequelize.define('PasswordRecovery', {
    email: DataTypes.STRING,
    tempPassword: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return PasswordRecovery;
};