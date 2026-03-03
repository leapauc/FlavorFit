export interface PatientInfo {
  id_patient: number;
  id_praticien: number;
  lastname: string;
  firstname: string;
  age: number;
  email: string;
  phone: string;
  address: string[];
  date_creation: string;
  pathologies: string | null;
  allergies: string[] | null;
  conviction: string[] | null;
  history: string | null;
  other: string | null;
}

export interface PatientForm {
  id_patient?: number;
  lastname: string;
  firstname: string;
  age: number;
  email: string;
  phone: string;
  rue: string;
  complement: string;
  code_postal: string;
  ville: string;
  pathologies: string | null;
  allergies: string[] | null;
  conviction: string | null;
  history: string | null;
  other: string | null;
}

export interface PatientCreate {
  id_praticien: number;
  lastname: string;
  firstname: string;
  age: number;
  email: string;
  phone: string;
  address: string[];
  pathologies?: string[] | null;
  allergies?: string[] | null;
  conviction?: string | null;
  history?: string | null;
  other?: string | null;
}
