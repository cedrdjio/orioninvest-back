// src/services/UserService.ts

import User from '../models/User';

class UserService {
  // Récupération du profil de l'utilisateur
  static async getProfile(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }, // Exclure le mot de passe du profil
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user;
  }

  // Récupération de la liste des filleuls
  static async getReferrals(userId: number) {
    return await User.findAll({
      where: { referrer_id: userId },
      attributes: ['id', 'name', 'phone_number', 'email', 'createdAt'],
    });
  }
}

export default UserService;
