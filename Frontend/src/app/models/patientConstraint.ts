export interface PatientConstraint {
  id_patient: number;
  pathologies: string[] | null;
  allergies: string[] | null;
  conviction: string | null;
  history: string | null;
  other: string | null;
}
