'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'image', {
      type: Sequelize.STRING,
      allowNull: true, // Autorise les valeurs NULL pour les packages existants
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('packages', 'image');
  }
};
