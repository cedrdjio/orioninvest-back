export interface RegisterDTO {
    name: string;
    phone_number: string;
    email?: string;
    password: string;
    referrer_code?: string;
  }
  
  export interface LoginDTO {
    phone_number: string;
    password: string;
  }
  