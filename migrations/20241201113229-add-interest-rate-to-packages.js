'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'interestRate', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, // Intérêt par défaut
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('packages', 'interestRate');
  }
};
