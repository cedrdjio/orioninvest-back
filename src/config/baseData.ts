import bcrypt from 'bcrypt'; 
import User from '../models/User';
import sequelize from './database';


const hashPassword = async (password: string ) => {
  const saltRounds = 10; 
  return await bcrypt.hash(password, saltRounds);
};

const createDefaultUser = async () => {
  const existingUser = await User.findOne({ where: { email: 'jean.dupont@example.com' } });

  if (!existingUser) {
    try {
      const hashedPassword = await hashPassword('hashed_password');
     
      await User.create({
        phone_number: '+33 6 12 34 56 78', 
        email: 'jean.dupont@example.com', 
        name: 'Jean Dupont', 
        password: hashedPassword, 
        referral_code: 'JDUPONT2024', 
        referrer_id: 'JDUPONT2024', 
        balance: 0.0, 
        referral_balance: 0.0, 
      });
      console.log('Utilisateur par défaut créé avec succès.');
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
    }
  } else {
    console.log('L\'utilisateur par défaut existe déjà.');
  }
};
export default createDefaultUser;
