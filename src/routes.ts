import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { PackageController } from './controllers/package.controller';
import { TransactionController } from './controllers/transaction.controller';
import { authenticateToken } from './middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();
const packageController = new PackageController();
const transactionController = new TransactionController();


// Auth Routes
router.post('/auth/register', authController.signup);
router.post('/auth/login', authController.signin);
// router.post('/auth/refresh', authController.refreshToken);

// User Profile
// router.get('/profile', authenticateToken, authController.getProfile);

// Package Routes
router.post('/packages', authenticateToken, packageController.createPackage);
router.get('/packages', authenticateToken, packageController.listPackages);

// Transaction Routes
router.post('/transaction/deposit', authenticateToken, transactionController.deposit);
router.post('/transaction/withdraw', authenticateToken, transactionController.withdraw);
router.get('/transaction/history', authenticateToken, transactionController.transactionHistory);

export default router;
