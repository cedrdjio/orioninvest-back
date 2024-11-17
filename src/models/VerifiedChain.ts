import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Définition des attributs du modèle
interface VerifiedChainAttributes {
  id: number;
  chain: string;
  isVerified: boolean;
}

// Définition des attributs optionnels pour la création
interface VerifiedChainCreationAttributes extends Optional<VerifiedChainAttributes, 'id' | 'isVerified'> {}

// Définition du modèle
class VerifiedChain
  extends Model<VerifiedChainAttributes, VerifiedChainCreationAttributes>
  implements VerifiedChainAttributes {
  public id!: number;
  public chain!: string;
  public isVerified!: boolean;
}

VerifiedChain.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chain: {
      type: DataTypes.STRING,
      allowNull: false, // La chaîne est obligatoire
      unique: true, // La chaîne doit être unique
      validate: {
        isCorrectFormat(value: string) {
          // Expression régulière pour les formats
          const mtnRegex1 = /^\d{10}$/; // Exemple : 10228436694 ou 9366396580
          const orangeRegex = /^[A-Z]{2}\d{6}\.\d{4}\.A\d{5}$/; // Exemple : XX241011.0939.A27968

          if (!mtnRegex1.test(value) && !orangeRegex.test(value)) {
            throw new Error(
              "La chaîne doit respecter l'un des formats suivants : 10 chiffres pour MTN ou '<Préfixe><6 chiffres>.<4 chiffres>.A<5 chiffres>' pour Orange."
            );
          }
        },
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Valeur par défaut : false
    },
  },
  {
    sequelize, // Connexion Sequelize
    modelName: 'VerifiedChain', // Nom du modèle
    tableName: 'verified_chains', // Nom de la table
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

export default VerifiedChain;
