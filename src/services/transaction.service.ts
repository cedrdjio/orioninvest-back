import Transaction from '../models/Transaction';
import User from '../models/User';
import Package from '../models/Package';

export class TransactionService {
  // Dépôt de fonds
  static async deposit(userEmail: string, amount: number, operatorNumber: string, operatorTransactionId: string) {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error('User not found');
    }

    const transaction = await Transaction.create({
      userId: user.id,
      type: 'deposit',
      amount,
      operatorNumber,
      operatorTransactionId,
    });

    // Mise à jour du solde de l'utilisateur
    user.balance += amount;
    await user.save();

    return transaction;
  }

  // Retrait de fonds
  static async withdraw(userEmail: string, amount: number, operatorNumber: string) {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user || user.balance < amount) {
      throw new Error('Insufficient funds');
    }

    const transaction = await Transaction.create({
      userId: user.id,
      type: 'withdraw',
      amount,
      operatorNumber,
    });

    // Mise à jour du solde de l'utilisateur
    user.balance -= amount;
    await user.save();

    return transaction;
  }

  // Achat d'un package (crée une transaction)
  static async purchasePackage(userEmail: string, packageId: number) {
    const user = await User.findOne({ where: { email: userEmail } });
    const packageToBuy = await Package.findByPk(packageId);

    if (!user || !packageToBuy) {
      throw new Error('User or package not found');
    }
    if (user.balance < packageToBuy.price) {
      throw new Error('Insufficient funds');
    }

    const transaction = await Transaction.create({
      userId: user.id,
      type: 'purchase',
      amount: packageToBuy.price,
      packageId: packageToBuy.id,
    });

    // Déduire le prix du package du solde de l'utilisateur
    user.balance -= packageToBuy.price;
    await user.save();

    return transaction;
  }

  // Historique des transactions
  static async transactionHistory(userEmail: string) {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error('User not found');
    }

    const transactions = await Transaction.findAll({ where: { userId: user.id } });
    return transactions;
  }
}
