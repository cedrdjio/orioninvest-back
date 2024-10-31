import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database'; // Assure-toi que ton fichier config Sequelize est correct

interface UserAttributes {
  id: number;
  phone_number: string;
  email: string;
  name: string;
  password: string;
  referral_code: string;
  referrer_id?: string ;
  balance: number;
  referral_balance: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'referrer_id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public phone_number!: string;
  public email!: string;
  public name!: string;
  public password!: string;
  public referral_code!: string;
  public referrer_id?: string ;
  public balance!: number;
  public referral_balance!: number;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Numéro unique
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Email unique
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referral_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referrer_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    balance: { type: DataTypes.FLOAT, defaultValue: 0 },
    referral_balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users', // Optionnel : correspond à la table SQL
    timestamps: true,   // Active les colonnes createdAt et updatedAt
  }
);

export default User;
