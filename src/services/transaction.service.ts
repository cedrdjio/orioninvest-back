import User from '../models/User';
import Transaction from '../models/Transaction';
import Package from '../models/Package';

export class TransactionService {
  async purchasePackage(userId: number, packageId: number) {
    const packageItem = await Package.findByPk(packageId);
    const user = await User.findByPk(userId);

    if (!packageItem || !user) throw new Error('Invalid package or user');

    // Check if user has sufficient funds
    if (user.balance < packageItem.price) throw new Error('Insufficient funds');

    // Deduct package price and create transaction
    user.balance -= packageItem.price;
    await user.save();

    return await Transaction.create({
      userId,
      type: 'package_purchase',
      amount: packageItem.price,
      packageId,
    });
  }

  async deposit(userId: number, amount: number, operatorInfo: { number: string; transactionId: string }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('Invalid user');

    user.balance += amount;
    await user.save();

    return await Transaction.create({
      userId,
      type: 'deposit',
      amount,
      operatorNumber: operatorInfo.number,
      operatorTransactionId: operatorInfo.transactionId,
    });
  }

  async withdraw(userId: number, amount: number) {
    const user = await User.findByPk(userId);
    if (!user || user.balance < amount) throw new Error('Invalid user or insufficient funds');

    user.balance -= amount;
    await user.save();

    return await Transaction.create({
      userId,
      type: 'withdrawal',
      amount,
    });
  }
}
