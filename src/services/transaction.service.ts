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
    // Validation des paramètres d'entrée
    if (!amount || amount <= 0) {
      throw new Error('Le montant du retrait doit être supérieur à zéro.');
    }
    // Récupération de l'utilisateur par email
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }
    // Vérification de l'achat de package préalable
    const purchaseExists = await Transaction.findOne({
      where: {
        userId: user.id,
        type: 'package_purchase',
      },
    });
    if (!purchaseExists) {
      throw new Error(
        "Vous devez effectuer un achat de package avant de pouvoir effectuer un retrait."
      );
    }
    // Calcul du solde total (balance + referral_balance)
    const totalBalance = user.balance + user.referral_balance;
    if (totalBalance < amount) {
      throw new Error("Fonds insuffisants pour effectuer le retrait.");
    }
    // Création de la transaction de retrait
    const transaction = await Transaction.create({
      userId: user.id,
      type: 'withdraw',
      amount,
      operatorNumber,
    });
    // Déduit le montant en priorité de `balance`, puis de `referral_balance` si nécessaire
    if (user.balance >= amount) {
      user.balance -= amount;
    } else {
      const remainingAmount = amount - user.balance;
      user.balance = 0;
      user.referral_balance -= remainingAmount;
    }
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
