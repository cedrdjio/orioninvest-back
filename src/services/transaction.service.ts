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
  // Vérification que le montant est supérieur à zéro
  if (amount <= 0) {
    throw new Error("Le montant doit être supérieur à zéro.");
  }

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
    name: user.name,
    operatorNumber: user.phone_number,
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
  // Constants


  static async withdraw(
    userEmail: string,
    amount: number,
    operatorNumber: string
  ) {
    const WITHDRAWAL_COMMISSION_RATE = 0.15;
  
    // Validation des paramètres d'entrée
    if (!amount || amount <= 0) {
      throw new Error("Le montant du retrait doit être supérieur à zéro.");
    }
  
    // Récupération de l'utilisateur par email
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }
  
    // Vérification de l'achat de package préalable
    const hasPurchasedPackage = await Transaction.findOne({
      where: { userId: user.id, type: "package_purchase" },
    });
    if (!hasPurchasedPackage) {
      throw new Error(
        "Vous devez effectuer un achat de package avant de pouvoir effectuer un retrait."
      );
    }
  
    // Calcul du solde total (balance + referral_balance)
    const totalBalance = parseFloat(user.balance.toString()) + parseFloat(user.referral_balance.toString());
    if (totalBalance < amount) {
      throw new Error("Fonds insuffisants pour effectuer le retrait.");
    }
  
    // Calcul du montant après commission
    const amountAfterCommission = amount * (1 - WITHDRAWAL_COMMISSION_RATE);
  
    // Création de la transaction de retrait
    const transaction = await Transaction.create({
      userId: user.id,
      type: "withdrawal",
      amount: amountAfterCommission,
      operatorNumber,
      status: "pending", // Initial status set to pending
    });
  
    // Mise à jour du montant total retiré
    user.TotalWithdraw = (user.TotalWithdraw || 0) + amount;
  
    // Assurez-vous que balance et referral_balance sont des nombres
    let userBalance = parseFloat(user.balance.toString());
    let userReferralBalance = parseFloat(user.referral_balance.toString());
  
    // Mise à jour des soldes utilisateur
    if (userBalance >= amount) {
      userBalance -= amount;
    } else {
      const remainingAmount = amount - userBalance;
      userBalance = 0;
      userReferralBalance -= remainingAmount;
    }
  
    // Sauvegarde des modifications
    user.balance = userBalance;  // Met à jour balance
    user.referral_balance = userReferralBalance;  // Met à jour referral_balance
    await user.save();
  
    // Retour de la transaction créée
    return transaction;
  }
  

    //---------------------------------------------------------------------------------------




  // Achat d'un package avec distribution des commissions pour les parrains
static async purchasePackage(userEmail: string, packageId: number) {
  try {
    // Récupérer l'utilisateur et le package
    const user = await User.findOne({ where: { email: userEmail } });
    const packageToBuy = await Package.findByPk(packageId);

    if (!user || !packageToBuy) {
      throw new Error("Utilisateur ou package introuvable.");
    }

    // Calculer le total des fonds disponibles
    const totalFunds = user.balance + user.referral_balance;

    // Vérifier si l'utilisateur a suffisamment de fonds
    if (totalFunds < packageToBuy.price) {
      throw new Error("Fonds insuffisants pour effectuer cet achat.");
    }

    // Déduire le prix du package des soldes utilisateur
    let remainingAmount = packageToBuy.price;

    if (user.balance >= remainingAmount) {
      user.balance -= remainingAmount;
      remainingAmount = 0;
    } else {
      remainingAmount -= user.balance;
      user.balance = 0;
    }

    if (remainingAmount > 0) {
      user.referral_balance -= remainingAmount;
    }

    await user.save();

    // Créer une transaction pour l'achat
    const transaction = await Transaction.create({
      userId: user.id,
      type: "package_purchase",
      amount: packageToBuy.price,
      packageId: packageToBuy.id,
      status: "completed",
    });

    // Distribution des commissions
    await this.distributeCommissions(user, packageToBuy);

    // Retourner la transaction d'achat
    return transaction;

  } catch (error) {
    console.error("Erreur lors de l'achat d'un package :", error);
    throw error;
  }
}


// Méthode pour distribuer les commissions aux parrains
static async distributeCommissions(user: User, packageToBuy: Package) {
  try {
    // Recherche du parrain direct en utilisant le referral_code
    const directReferrer = user.referrer_id ? await User.findOne({ where: { referral_code: user.referrer_id } }) : null;

    if (directReferrer) {
      // Calcul de la commission pour le parrain direct (10 %)
      const directReferrerCommission = (packageToBuy.price * 10) / 100;
      directReferrer.referral_balance = (directReferrer.referral_balance || 0) + directReferrerCommission;
      await directReferrer.save();

      // Enregistrement de la transaction pour le parrain direct
      await Transaction.create({
        userId: directReferrer.id,
        type: "deposit",
        amount: directReferrerCommission,
        packageId: packageToBuy.id,
        status: "completed",
      });

      console.log(`Commission directe attribuée à l'utilisateur ${directReferrer.id}: ${directReferrerCommission}`);

      // Recherche du grand-parent en utilisant le referral_code du parrain
      const grandParentReferrer = directReferrer.referrer_id ? await User.findOne({ where: { referral_code: directReferrer.referrer_id } }) : null;

      if (grandParentReferrer) {
        // Calcul de la commission pour le grand-parent (5 %)
        const grandParentReferrerCommission = (packageToBuy.price * 5) / 100;
        grandParentReferrer.referral_balance = (grandParentReferrer.referral_balance || 0) + grandParentReferrerCommission;
        await grandParentReferrer.save();

        // Enregistrement de la transaction pour le grand-parent
        await Transaction.create({
          userId: grandParentReferrer.id,
          type: "deposit",
          amount: grandParentReferrerCommission,
          packageId: packageToBuy.id,
          status: "completed",
        });

        console.log(`Commission indirecte attribuée à l'utilisateur ${grandParentReferrer.id}: ${grandParentReferrerCommission}`);
      } else {
        console.log("Aucun grand-parent trouvé pour le parrain direct.");
      }
    } else {
      console.log("Aucun parrain direct trouvé pour l'utilisateur.");
    }
  } catch (error) {
    console.error("Erreur lors de la gestion des commissions :", error);
    throw error;
  }
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

  // Vérification du type de transaction
  if (transaction.type === 'deposit') {
    // Assurez-vous que user.balance est un nombre
    const currentBalance = parseFloat(user.balance.toString()); // Convertir en nombre si nécessaire
    const amount = parseFloat(transaction.amount.toString());
    user.balance = currentBalance + amount;

    await user.save();  // Attendre la sauvegarde de l'utilisateur
  } else {
    // Si la transaction n'est pas de type "deposit", retourner sans modification
    return;
  }

  // Mettre à jour le statut de la transaction à "completed"
  await transaction.update({ status: 'completed' });

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






// Fonction pour récupérer la liste des packages achetés 
static async getUserPackagePurchases(userEmail: string) {
  // Trouver l'utilisateur par son email
  const user = await User.findOne({ where: { email: userEmail } });
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Récupérer toutes les transactions de type 'package_purchase' pour cet utilisateur
  const transactions = await Transaction.findAll({
    where: { 
      type: 'package_purchase', 
      userId: user.id 
    },
  });

  // Formater les résultats pour inclure les détails du package
  const result = [];

  for (const transaction of transactions) {
    // Récupérer le package associé via packageId
    const packageData = await Package.findByPk(transaction.packageId);
    
    if (!packageData) {
      console.warn(`Package non trouvé pour la transaction ID: ${transaction.id}`);
      continue;
    }

    result.push({
      transactionId: transaction.id,
      packageName: packageData.name,
      packageImage: packageData.image,
      packageProgress: packageData.progressPercentage,
      purchaseDate: transaction.createdAt, // Date de l'achat
      amountPaid: transaction.amount, // Montant payé pour le package
    });
  }

  return result;
}



  
}
