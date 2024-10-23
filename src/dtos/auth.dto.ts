export interface RegisterDTO {
    name: string;
    phone: string;
    email?: string;
    password: string;
    referralCode?: string;
  }
  
  export interface LoginDTO {
    phone: string;
    password: string;
  }
  