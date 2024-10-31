// src/models/Transaction.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Package from './Package';

class Transaction extends Model {
  public id!: number;
  public userId!: number;
  public packageId?: number; // Pour les achats de package
  public type!: 'package_purchase' | 'deposit' | 'withdrawal';
  public amount!: number;
  public operatorNumber?: string; // Pour les dépôts
  public operatorTransactionId?: string; // Pour les dépôts
  public status!: 'pending' | 'completed' | 'failed';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Package,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('package_purchase', 'deposit', 'withdrawal'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Le montant doit être un nombre décimal valide',
        },
        min: {
          args: [0],
          msg: 'Le montant doit être supérieur ou égal à 0',
        },
      },
    },
    operatorNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [8, 15],
          msg: 'Le numéro de l’opérateur doit être valide',
        },
      },
    },
    operatorTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'completed',
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Transactions',
    timestamps: true,   // Active les colonnes createdAt et updatedAt
    tableName: 'transactions',
  }
);

Transaction.belongsTo(User, { foreignKey: 'userId' });
Transaction.belongsTo(Package, { foreignKey: 'packageId' });

export default Transaction;
