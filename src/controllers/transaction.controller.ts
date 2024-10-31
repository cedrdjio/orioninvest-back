// src/controllers/transaction.controller.ts
import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import User from '../models/User';
import Package from '../models/Package';

export class TransactionController {
  // Dépôt de fonds
  async deposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { amount, operatorNumber, operatorTransactionId } = req.body;
    const userId = req.body.id;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const transaction = await Transaction.create({
        userId,
        type: 'deposit',
        amount,
        operatorNumber,
        operatorTransactionId,
      });

      // Mise à jour du solde de l'utilisateur
      user.balance += amount;
      await user.save();

      res.status(201).json(transaction);
    } catch (error) {
      console.error(error);
      next(error); // Gestion d'erreur centralisée
    }
  }

  // Retrait de fonds
  async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { amount, operatorNumber } = req.body;
    const userId = req.body.id;

    try {
      const user = await User.findByPk(userId);
      if (!user || user.balance < amount) {
        res.status(400).json({ message: 'Insufficient funds' });
        return;
      }

      const transaction = await Transaction.create({
        userId,
        type: 'withdraw',
        amount,
        operatorNumber,
      });

      // Mise à jour du solde de l'utilisateur
      user.balance -= amount;
      await user.save();

      res.status(201).json(transaction);
    } catch (error) {
      console.error(error);
      next(error); // Gestion d'erreur centralisée
    }
  }

  // Achat d'un package (crée une transaction)
  async purchasePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { packageId } = req.body;
    const userId = req.body.id;

    try {
      const user = await User.findByPk(userId);
      const packageToBuy = await Package.findByPk(packageId);

      if (!user || !packageToBuy) {
        res.status(404).json({ message: 'User or package not found' });
        return;
      }
      if (user.balance < packageToBuy.price) {
        res.status(400).json({ message: 'Insufficient funds' });
        return;
      }

      const transaction = await Transaction.create({
        userId,
        type: 'purchase',
        amount: packageToBuy.price,
        packageId: packageToBuy.id,
      });

      // Déduire le prix du package du solde de l'utilisateur
      user.balance -= packageToBuy.price;
      await user.save();

      res.status(201).json(transaction);
    } catch (error) {
      console.error(error);
      next(error); // Gestion d'erreur centralisée
    }
  }

  // Historique des transactions
  async transactionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.body.id;

    try {
      const transactions = await Transaction.findAll({ where: { userId } });
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      next(error); // Gestion d'erreur centralisée
    }
  }
}
