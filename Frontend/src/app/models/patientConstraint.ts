export interface PatientConstraint {
  id_patient: number;
  pathologies: string[] | null;
  allergies: string[] | null;
  convictions?: string[] | null;
  restrictions?: string[] | null;
  conviction?: string | null;
  history: string | null;
  other: string | null;
}
