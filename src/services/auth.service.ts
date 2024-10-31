import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { RegisterDTO } from '../dtos/auth.dto';
import { Op } from 'sequelize';  // Import Sequelize operator

function generateReferralCode(name: string) {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${name}-${randomString}`.toUpperCase();
}

export class AuthService {
  async register(data: RegisterDTO) {
    const { phone_number, email, password, name, referrer_code } = data;

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone_number }] },
    });
    if (existingUser) {
      throw new Error('L’email ou le numéro de téléphone est déjà utilisé.');
    }

    let referrer = null;
    if (referrer_code) {
      referrer = await User.findOne({ where: { referral_code: referrer_code } });
      if (!referrer) throw new Error('Code de référence invalide.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const referral_code = generateReferralCode(name);

    const user = await User.create({
      name,
      phone_number,
      email: email ?? '',
      password: hashedPassword,
      referral_code,
      referrer_id: referrer ? referrer.id : null,
      balance: 0,
      referral_balance: 0
    });

    return user;
  }

  async login(identifier: string, password: string) {
    // Chercher l'utilisateur par email ou numéro de téléphone
    const user = await User.findOne({
      where: { [Op.or]: [{ email: identifier }, { phone_number: identifier }] },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Identifiants invalides.');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return { user, token };
  }
}

export const authService = new AuthService();
