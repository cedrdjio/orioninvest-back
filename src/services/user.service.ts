import User from "../models/User";

class UserService {
  static async getProfile(email: string) {
    const user = await User.findOne({
      where: { email },
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user;
  }

  static async getReferrals(userEmail: number) {
    const referrer = await User.findOne({ where: { email: userEmail } });
    if (!referrer)
      throw new Error("code de parrainage non existant contacter l'admin");
    return await User.findAll({
      where: { referrer_id: referrer.referral_code },
      attributes: ["id", "name", "phone_number", "email", "createdAt"],
    });
  }
}

export default UserService;
