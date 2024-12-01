// src/models/Package.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Package extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public duration!: number; // Durée en jours

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
      validate: {
        notEmpty: {
          msg: 'Le nom du package ne peut pas être vide',
        },
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La description du package ne peut pas être vide',
        },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Le prix doit être un nombre décimal valide',
        },
        min: {
          args: [0],
          msg: 'Le prix doit être supérieur ou égal à 0',
        },
      },
    },
    duration: {
      type: DataTypes.INTEGER, // Durée en jours
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'La durée doit être au moins 1 jour',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Package',
    timestamps: true,
    tableName: 'packages',
  }
);

export default Package;
