import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Package extends Model {
  public id!: number;
  public name!: string;
  public price!: number;
  public interestRate!: number;
  public duration!: number;
  public niche?: string; // Ajout du champ niche

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
    niche: { // Nouveau champ
      type: DataTypes.STRING,
      allowNull: true, // Autorise les valeurs nulles
    },
  },
  {
    sequelize,
    modelName: 'Package',
    tableName: 'packages',
    timestamps: true, // Ajoute les champs createdAt et updatedAt
  }
);

export default Package;
