export class CustomError extends Error {
    public status: number;
  
    constructor(message: string, status: number) {
      super(message); // Appelle le constructeur de la classe mère Error
      this.status = status; // Définit le statut HTTP
      Object.setPrototypeOf(this, CustomError.prototype); // Maintient la chaîne prototype
    }
  }
  