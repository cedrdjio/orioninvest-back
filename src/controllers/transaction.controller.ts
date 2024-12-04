import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {

  async initDepositTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { amount, operatorTransactionId, userId } = req.body;
  
      // Vérification des champs requis
      if (!amount || !userId) {
        res.status(400).json({
          error: "Les champs amount et userId sont requis.",
        });
        return;
      }
      // Vérification du format de operatorTransactionId
      const operatorTransactionIdRegex = /^[A-Z]{2}\d{6}\.\d{4}\.[A-Z0-9]{6}$|^\d{10,11}$/;
      if (!operatorTransactionIdRegex.test(operatorTransactionId)) {
        res.status(400).json({
          error: "Le format de operatorTransactionId est incorrect.",
        });
        return;
      }
  
      // Appel au service pour initialiser la transaction
      const transaction = await TransactionService.initDepositTransaction(
        amount,
        operatorTransactionId,
        userId
      );
  
      res.status(201).json({
        message: "Transaction initiée avec succès.",
        transaction,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  








  // Confirmer une transaction de dépôt
  async confirmDepositTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { operatorTransactionId, amount, operatorNumber } = req.body;
      // @ts-ignore
      const userEmail = req.user.email; // Assurez-vous que l'email de l'utilisateur est ajouté au middleware auth
      if (!operatorTransactionId || !amount || !operatorNumber) {
        res.status(400).json({ error: "Les champs operatorTransactionId, amount et operatorNumber sont requis." });
      }
      const transaction = await TransactionService.confirmDepositTransaction(
        userEmail,
        operatorTransactionId,
        amount,
        operatorNumber
      );
      res.status(200).json({ message: "Transaction confirmée avec succès.", transaction });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }


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

  // // Retrait de fonds
  // async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   // @ts-ignore
  //   const { amount, operatorNumber } = req.user;
  //   // @ts-ignore
  //   const userEmail = req.user.email;

  //   try {
  //     const transaction = await TransactionService.withdraw(userEmail, amount, operatorNumber);
  //     res.status(201).json(transaction);
  //   } catch (error) {
  //     console.error(error);
  //     if (error instanceof Error) {
  //       res.status(400).json({ message: error.message });
  //     } else {
  //       res.status(500).json({ message: 'An unexpected error occurred' });
  //     }
  //   }
  // }
   async withdraw(req: Request, res: Response): Promise<void> {
    try {
     // @ts-ignore
      const { email: userEmail } = req.user; // On suppose que l'email est extrait du token et injecté dans `req.user`.
      const { amount, operatorNumber } = req.body;

      // Vérification des paramètres requis
      if (!userEmail || !amount || !operatorNumber) {
        res.status(400).json({
          message: "Les paramètres requis sont manquants.",
        });
        return;
      }

      // Appel du service `withdraw`
      const transaction = await TransactionService.withdraw(
        userEmail,
        amount,
        operatorNumber
      );

      // Réponse en cas de succès
      res.status(201).json({
        // message: "Retrait effectué avec succès.",
        transaction,
      });
    } catch (error: any) {
      // Gestion des erreurs spécifiques
      if (
        [
          "Le montant du retrait doit être supérieur à zéro.",
          "Utilisateur non trouvé.",
          "Vous devez effectuer un achat de package avant de pouvoir effectuer un retrait.",
          "Fonds insuffisants pour effectuer le retrait.",
        ].includes(error.message)
      ) {
        res.status(417).json({ message: error.message });
        return;
      }

      // Gestion des erreurs générales
      console.error("Erreur lors du retrait:", error);
      res.status(500).json({
        message: "Une erreur interne s'est produite.",
      });
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
        res.status(417).json({ message: error.message });
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


//-------------------------------------------------------------------------

// Route pour récupérer les transactions en attente (pending) de type 'deposit' ou 'withdrawal'
// Route pour récupérer les transactions en attente
async getPendingTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const transactions = await TransactionService.getPendingTransactions();
    res.status(200).json(transactions);  // Retourne les transactions au format JSON
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });  // Gère l'erreur avec un message précis
    } else {
      res.status(500).json({ message: 'Une erreur inattendue est survenue' });  // Gestion générique d'erreur
    }
  }
}

//-------------------------------------------------------------------------



// Route pour marquer une transaction comme "complétée"
// Marquer une transaction comme "complétée"
async markTransactionAsCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { transactionId } = req.params;
    const updatedTransaction = await TransactionService.markTransactionAsCompleted(Number(transactionId));
    res.status(200).json({
      message: 'Transaction marked as completed successfully',
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
}


//-------------------------------------------------------------------------

// Marquer une transaction comme "échec"
async markTransactionAsFailed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { transactionId } = req.params;
    const updatedTransaction = await TransactionService.markTransactionAsFailed(Number(transactionId));
    res.status(200).json({
      message: 'Transaction marked as failed successfully',
      transaction: updatedTransaction,
    });
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
