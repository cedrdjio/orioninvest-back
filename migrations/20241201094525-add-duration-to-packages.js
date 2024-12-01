'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 30, // Exemple : valeur par défaut de 30 jours
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('packages', 'duration');
  }
};
