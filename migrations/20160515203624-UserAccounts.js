'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('UserAccounts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      UserId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      AccountId: {
        type: Sequelize.UUID,
        references: {
          model: 'Accounts',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Accounts');
  }
};

 // attr4: {
 //        type: Sequelize.INTEGER,
 //        references: {
 //            model: 'another_table_name',
 //            key: 'id'
 //        },
 //        onUpdate: 'cascade',
 //        onDelete: 'cascade'
 //    }