'use strict';
module.exports = function(sequelize, DataTypes) {
  var UserAccount = sequelize.define('UserAccount', {
    UserId: DataTypes.UUID,
    AccountId: DataTypes.UUID
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return UserAccount;
};