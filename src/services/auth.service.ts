import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';
import { CustomError } from '../common/errors/CustomError';

export class AuthService {
  async register(data: RegisterDTO) {
    const { phone, password } = data;
    const existingUser = await User.findOne({ where: { phone } });

    if (existingUser) {
      throw new CustomError('Numéro de téléphone déjà utilisé', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...data,
      password: hashedPassword,
    });

    return newUser;
  }

  async login(data: LoginDTO) {
    const { phone, password } = data;
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      throw new CustomError('Utilisateur non trouvé', 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new CustomError('Identifiants incorrects', 401);
    }

    const token = jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { token, user };
  }
}
