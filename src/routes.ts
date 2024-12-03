import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import VerifiedChainController from './controllers/VerifiedChain.controller';
import { PackageController } from './controllers/package.controller';
import { TransactionController } from './controllers/transaction.controller';
import { authenticateToken } from './middlewares/auth.middleware';
import UserController from './controllers/user.controller';

const router = Router();
const authController = new AuthController();
const packageController = new PackageController();
const transactionController = new TransactionController();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   securityDefinitions:
 *       Bearer:
 *       type: apiKey
 *       name: Authorization
 *       in: header
 *       description: >-
 *         Enter the token with the `Bearer: ` prefix, e.g. "Bearer abcde12345".
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         phone_number:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         referral_code:
 *           type: string
 *         balance:
 *           type: number
 *         referral_balance:
 *           type: number
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               referral_code:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
router.post('/auth/register', authController.signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', authController.signin);

/**
 * @swagger
 * /packages/create:
 *   post:
 *     summary: Create a new package
 *     tags: [Packages]
 *     security:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Package created successfully
 */
router.post('/packages/create', packageController.createPackage);


/**
 * @swagger
 * /packages/list:
 *   get:
 *     summary: List all packages
 *     tags: [Packages]
 *     security:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *     responses:
 *       200:
 *         description: A list of packages
 */
router.get('/packages/list', packageController.listPackages);
router.get('/packages/list/:id', packageController.getPackageById);

/**
 * @swagger
 * /transaction/deposit:
 *   post:
 *     summary: Deposit money
 *     tags: [Transaction]
 *     security:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               operatorNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit successful
 */
router.post('/transaction/deposit', authenticateToken, transactionController.deposit);
/**
 * @swagger
 * /transaction/init-deposit:
 *   post:
 *     summary: Initier une transaction de dépôt
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Montant à déposer.
 *                 example: 1000
 *               operatorTransactionId:
 *                 type: string
 *                 description: Identifiant unique de la transaction opérateur.
 *                 example: "OP123456789"
 *     responses:
 *       201:
 *         description: Transaction initiée avec succès
 *       400:
 *         description: Erreur de validation ou autre problème
 */
router.post('/transaction/init-deposit', transactionController.initDepositTransaction);

/**
 * @swagger
 * /transaction/confirm-deposit:
 *   post:
 *     summary: Confirmer une transaction de dépôt
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               operatorTransactionId:
 *                 type: string
 *                 description: Identifiant unique de la transaction opérateur.
 *                 example: "OP123456789"
 *               amount:
 *                 type: number
 *                 description: Montant de la transaction.
 *                 example: 1000
 *               operatorNumber:
 *                 type: string
 *                 description: Numéro de l'opérateur.
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Transaction confirmée avec succès
 *       400:
 *         description: Erreur de validation ou autre problème
 */
router.post('/transaction/confirm-deposit', authenticateToken, transactionController.confirmDepositTransaction);



/**
 * @swagger
 * /transactions/purchase-package:
 *   post:
 *     summary: Purchase a package and create a transaction
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageId:
 *                 type: integer
 *                 description: The ID of the package to purchase.
 *             required:
 *               - packageId
 *     responses:
 *       201:
 *         description: Transaction successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the transaction.
 *                 userId:
 *                   type: integer
 *                   description: The ID of the user who made the transaction.
 *                 type:
 *                   type: string
 *                   description: The type of transaction (e.g., purchase).
 *                 amount:
 *                   type: number
 *                   format: float
 *                   description: The amount of the transaction.
 *                 packageId:
 *                   type: integer
 *                   description: The ID of the purchased package.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the transaction was created.
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: An unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */
router.post('/transaction/purchase-package', authenticateToken, transactionController.purchasePackage);

/**
 * @swagger
 * /transaction/withdraw:
 *   post:
 *     summary: Withdraw money
 *     tags: [Transaction]
 *     security:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Withdrawal successful
 */
router.post('/transaction/withdraw', authenticateToken, transactionController.withdraw);

/**
 * @swagger
 * /transaction/history:
 *   get:
 *     summary: Get transaction history
 *     tags: [Transaction]
 *     security:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 */
router.get('/transaction/history', authenticateToken, transactionController.transactionHistory);
/**
  * @swagger
  * user/profile:
  *   get:
  *     summary: Récupérer le profil de l'utilisateur
  *     tags: [User]
  *     security:
*       bearerAuth:
*         type: http
*         scheme: bearer
*         bearerFormat: JWT
  *     responses:
  *       200:
  *         description: Profil utilisateur récupéré avec succès
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 id:
  *                   type: integer
  *                 phone_number:
  *                   type: string
  *                 email:
  *                   type: string
  *                 name:
  *                   type: string
  *                 referral_code:
  *                   type: string
  *                 balance:
  *                   type: number
  *                 referral_balance:
  *                   type: number
  *       400:
  *         description: Erreur système
  *       404:
  *         description: Utilisateur non trouvé
  */
router.get('/user/profile', authenticateToken, UserController.getProfile);
/**
 * @swagger
 * /verifiedChain:
 *   post:
 *     summary: Crée une nouvelle chaîne vérifiée
 *     description: Cette route permet de créer une nouvelle chaîne vérifiée en fournissant une chaîne valide.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chain:
 *                 type: string
 *                 example: '10228436694'
 *     responses:
 *       201:
 *         description: Chaîne vérifiée créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 chain:
 *                   type: string
 *                   example: '10228436694'
 *       400:
 *         description: Erreur de validation ou d'entrée
 *       500:
 *         description: Erreur serveur
 */
router.post('/verifiedChain', VerifiedChainController.createVerifiedChain);

/**
 * @swagger
 * /verifiedChains:
 *   get:
 *     summary: Récupère toutes les chaînes vérifiées
 *     description: Cette route permet de récupérer toutes les chaînes vérifiées.
 *     responses:
 *       200:
 *         description: Liste des chaînes vérifiées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   chain:
 *                     type: string
 *                     example: '10228436694'
 *                   isVerified:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Erreur serveur
 */
router.get('/verifiedChains', VerifiedChainController.getAllVerifiedChains);

/**
 * @swagger
 * /verifiedChain/{id}:
 *   get:
 *     summary: Récupère une chaîne vérifiée par son ID
 *     description: Cette route permet de récupérer une chaîne vérifiée en utilisant son ID unique.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la chaîne vérifiée
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Chaîne vérifiée trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 chain:
 *                   type: string
 *                   example: '10228436694'
 *       404:
 *         description: Chaîne vérifiée non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/verifiedChain/:id', VerifiedChainController.getVerifiedChainById);



router.get('/user/referrals', authenticateToken, UserController.getReferrals);
router.get('transaction/history/pending', transactionController.getPendingTransactions);

export default router;
