import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {

  // Dépôt de fonds
  async deposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    // @ts-ignore
    const { amount, operatorNumber, operatorTransactionId } = req.body;
    // @ts-ignore
    const userEmail = req.user.email;
    // @ts-ignore
    try {
      const transaction = await TransactionService.deposit(userEmail, amount, operatorNumber, operatorTransactionId);
      res.status(201).json(transaction);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Retrait de fonds
  async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
    // @ts-ignore
    const { amount, operatorNumber } = req.user;
    // @ts-ignore
    const userEmail = req.user.email;

    try {
      const transaction = await TransactionService.withdraw(userEmail, amount, operatorNumber);
      res.status(201).json(transaction);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  async purchasePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    // @ts-ignore
    const { packageId } = req.body;
    // @ts-ignore
    const userEmail = req.user.email;

    try {
      const transaction = await TransactionService.purchasePackage(userEmail, packageId);
      res.status(201).json(transaction);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Historique des transactions
  async transactionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    // @ts-ignore
    const userEmail = req.user.email;

    try {
      const transactions = await TransactionService.transactionHistory(userEmail);
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }
}
