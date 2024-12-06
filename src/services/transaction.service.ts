import Transaction from "../models/Transaction";
import User from "../models/User";
import Package from "../models/Package";
import { MessageEvent } from "http";

export class TransactionService {

  // Initialiser une transaction de dépôt
  static async initDepositTransaction(
    amount: number,
    operatorTransactionId: string,
    userId: number
  ) {
    // Vérification de l'existence d'une transaction similaire
    const existingTransaction = await Transaction.findOne({
      where: { operatorTransactionId, type: "deposit" },
    });
    if (existingTransaction) {
      throw new Error("Une transaction avec cet ID d'opérateur existe déjà.");
    }
  
    // Vérification de l'existence de l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("Utilisateur introuvable.");
    }
  
    // Création de la transaction avec un statut `pending`
    const transaction = await Transaction.create({
      userId,
      name : user.name,
      operatorNumber : user.phone_number,
      type: "deposit",
      amount,
      status: "pending",
      operatorTransactionId,
    });
  
    return transaction;
  }
  

  //---------------------------------------------------------------------------------------



  // Confirmer une transaction de dépôt
  static async confirmDepositTransaction( userEmail: string,operatorTransactionId: string,amount: number,operatorNumber: string) {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }
    // Recherche de la transaction par son `operatorTransactionId`
    const transaction = await Transaction.findOne({
      where: { operatorTransactionId, type: "deposit" },
    });
    if (!transaction) {
      throw new Error("Transaction non trouvée.Veuiller reessailler plutard svp ou contacter le service");
    }
    // Vérification du statut
    if (transaction.status === "failed") {
      throw new Error("Impossible de confirmer une transaction échouée.");
    }
    if (transaction.status === "completed") {
      throw new Error("Cette transaction a déjà été confirmée.");
    }
    // Mise à jour des informations de la transaction
    transaction.userId=user.id,
    transaction.operatorNumber = operatorNumber;
    transaction.status = "completed";
    await transaction.save();
    // Mise à jour du solde de l'utilisateur
    user.balance += amount;
    await user.save();
    return transaction;
  }


    //---------------------------------------------------------------------------------------




  // Dépôt de fonds
  static async deposit(
    userEmail: string,
    amount: number,
    operatorNumber: string,
    operatorTransactionId: string
  ) {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error("User not found");
    }

    const transaction = await Transaction.create({
      userId: user.id,
      type: "deposit",
      amount,
      operatorNumber,
      operatorTransactionId,
    });

    // Mise à jour du solde de l'utilisateur
    user.balance += amount;
    await user.save();

    return transaction;
  }

    //---------------------------------------------------------------------------------------






  // Retrait de fonds
  static async withdraw(
    userEmail: string,
    amount: number,
    operatorNumber: string
  ) {

    // Validation des paramètres d'entrée
    //if (!amount || amount <= 0) {
     // throw new Error("Le montant du retrait doit être supérieur à zéro.");
   // }
   
    // Récupération de l'utilisateur par email
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }
    // Vérification de l'achat de package préalable
    const purchaseExists = await Transaction.findOne({
      where: {
        userId: user.id,
        type: "package_purchase",
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
      type: "withdrawal",
      amount : amount - (amount*0.15),
      operatorNumber,
      status: 'pending'
    });

    user.TotalWithdraw += amount;

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

    //---------------------------------------------------------------------------------------




  /// Achat d'un package avec distribution des commissions pour les parrains
static async purchasePackage(userEmail: string, packageId: number) {
  const user = await User.findOne({ where: { email: userEmail } });
  const packageToBuy = await Package.findByPk(packageId);

  if (!user || !packageToBuy) {
    throw new Error("User or package not found");
  }

  if (user.balance < packageToBuy.price) {
    throw new Error("Votre solde est insuffisant pour l'achat");
  }

  // Créer une transaction pour l'achat et définir la startDate
  const transaction = await Transaction.create({
    userId: user.id,
    type: "package_purchase",
    amount: packageToBuy.price,
    packageId: packageToBuy.id,
    status: "completed",
    startDate: new Date(), // Définir la startDate au moment de l'achat
  });

  user.balance -= packageToBuy.price;
  await user.save();

  // Calcul des commissions pour les parrains
  const directReferrer = user.referrer_id ? await User.findByPk(user.referrer_id) : null;
  if (directReferrer) {
    const directReferrerCommission = (packageToBuy.price * 10) / 100;
    directReferrer.referral_balance += directReferrerCommission;    
    await directReferrer.save();

    await Transaction.create({
      userId: directReferrer.id,
      type: "commission",
      amount: directReferrerCommission,
      packageId: packageToBuy.id,
      status: "completed",
    });
  }

  // Vérification du grand-parent (parrain du parrain)
  if (directReferrer && directReferrer.referrer_id) {
    const grandParentReferrer = await User.findByPk(directReferrer.referrer_id);
    if (grandParentReferrer) {
      const grandParentReferrerCommission = (packageToBuy.price * 10) / 200;
      grandParentReferrer.referral_balance += grandParentReferrerCommission;
      await grandParentReferrer.save();

      await Transaction.create({
        userId: grandParentReferrer.id,
        type: "commission",
        amount: grandParentReferrerCommission,
        packageId: packageToBuy.id,
        status: "completed",
      });
    }
  }

  return transaction;
}



    //---------------------------------------------------------------------------------------





  // Historique des transactions
  static async transactionHistory(userEmail: string) {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await Transaction.findAll({
      where: { userId: user.id },
    });
    return transactions;
  }

  //-------------------------------------------------------------------------------------------

  // Récupérer les transactions en attente avec le nom de l'utilisateur
  public static async getPendingTransactions(): Promise<any> {
    try {
      // Recherche des transactions avec une jointure sur la table User pour obtenir le nom de l'utilisateur
      const transactions = await Transaction.findAll({
        where: {
          status: 'pending',
          type: ['deposit', 'withdrawal'],
        },
        include: [
          {
            model: User,
            attributes: ['name'],  // Inclure uniquement le champ 'name' du modèle User
          }
        ]
      });
      return transactions;  // Les transactions contiendront maintenant le nom de l'utilisateur
    } catch (error) {
      throw new Error('Erreur lors de la récupération des transactions en attente');
    }
  }

  //--------------------------------------------------------------------------------------------

  // Fonction pour marquer la transaction comme "complétée"
  static async markTransactionAsCompleted(transactionId: number) {
    const transaction = await Transaction.findByPk(transactionId);

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    // Récupérer l'utilisateur associé à la transaction
    const userId = transaction.userId; // Supposons que userId est un attribut de votre modèle Transaction
    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error("User not found");
    }
    if(transaction.type='deposit')
    {
      // Incrémenter la balance de l'utilisateur
      user.balance += transaction.amount;
    }
    else{
      return ;
    }
    

    // Mettre à jour le statut de la transaction et l'utilisateur
    await Promise.all([
        transaction.update({ status: 'completed' }),
        user.save(),
    ]);

    return transaction;
}

    //--------------------------------------------------------------------------------------------


// Fonction pour marquer la transaction comme "échec"
static async markTransactionAsFailed(transactionId: number) {
  const transaction = await Transaction.findByPk(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Mise à jour du statut à "failed"
  transaction.status = 'failed';
  await transaction.save(); // Sauvegarde la transaction mise à jour
  return transaction;
}

  
}
