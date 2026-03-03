export interface PatientContact {
  id_patient: number;
  lastname: string;
  firstname: string;
  age: number;
  email: string;
  phone: string;
  address: string[];
}

export interface PatientContactForm {
  id_patient: number;
  lastname: string;
  firstname: string;
  age: number;
  email: string;
  phone: string;
  rue: string;
  complement: string;
  code_postal: string;
  ville: string;
}
