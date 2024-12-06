'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('packages', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('packages', 'progressPercentage', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('packages', 'startDate');
    await queryInterface.removeColumn('packages', 'progressPercentage');
  }
};
