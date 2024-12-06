// src/models/Package.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Package extends Model {
  public id!: number;
  public name!: string;
  public price!: number;
  public interestRate!: number;
  public duration!: number;
  public niche?: string; // Champ niche
  public description?: string; // Champ description
  public image?: string; // Nouveau champ image
  public startDate?: Date;  // Date de début du package
  public progressPercentage!: number; // Progression du package pour chaque utilisateur

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Package.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    interestRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    niche: {
      type: DataTypes.STRING,
      allowNull: true, // Autorise la valeur null
    },
    description: { // Champ description
      type: DataTypes.STRING,
      allowNull: true, // Autorise la valeur null
    },
    image: { // Nouveau champ image
      type: DataTypes.STRING,
      allowNull: true, // Autorise la valeur null (pour les packages sans image)
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,  // Ce champ peut être null jusqu'à l'achat du package
    },
    progressPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,  // Initialisation de la progression à 0
      allowNull: false,  // Ce champ ne peut pas être nul
    },
  },
  {
    sequelize,
    modelName: 'Package',
    tableName: 'packages',
    timestamps: true,  // Active les champs createdAt et updatedAt
  }
);

export default Package;
