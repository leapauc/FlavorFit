import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PatientCreate, PatientInfo } from '../models/patientInfo';
import { PatientConstraint } from '../models/patientConstraint';
import { PatientContact } from '../models/patientContact';

/**
 * Service d'authentification.
 *
 * Gère la connexion, la déconnexion et la persistance des informations
 * d'utilisateur dans le localStorage. Permet également de vérifier si
 * l'utilisateur est connecté ou administrateur.
 */
@Injectable({
  providedIn: 'root',
})
export class PatientService {
  /**
   * URL de base de l'API utilisée pour les appels d'authentification.
   */
  private apiUrl = 'http://localhost:3000/patient';

  private selectedPatientSubject = new BehaviorSubject<PatientInfo | null>(
    null
  );
  selectedPatient$ = this.selectedPatientSubject.asObservable();

  /**
   * Crée une instance de  AuthService.
   * @param http Service Angular pour effectuer des requêtes HTTP.
   */
  constructor(private http: HttpClient) {}

  setSelectedPatient(patient: PatientInfo) {
    this.selectedPatientSubject.next(patient);
  }

  getSelectedPatient(): PatientInfo | null {
    return this.selectedPatientSubject.getValue();
  }

  getAllPatient(): Observable<PatientInfo[]> {
    return this.http.get<PatientInfo[]>(this.apiUrl);
  }

  getAllPatientByPraticien(id_praticien: number): Observable<PatientInfo[]> {
    return this.http.get<PatientInfo[]>(`${this.apiUrl}/all/${id_praticien}`);
  }

  getPatientById(id_patient: number): Observable<PatientInfo> {
    return this.http.get<PatientInfo>(`${this.apiUrl}/${id_patient}`);
  }

  getContactPatientById(id_patient: number): Observable<PatientContact> {
    return this.http.get<PatientContact>(
      `${this.apiUrl}/${id_patient}/contact`
    );
  }

  getConstraintPatientById(id_patient: number): Observable<PatientConstraint> {
    return this.http.get<PatientConstraint>(
      `${this.apiUrl}/${id_patient}/constraint`
    );
  }

  createPatient(patient: PatientCreate): Observable<PatientInfo> {
    return this.http.post<PatientInfo>(this.apiUrl, patient);
  }

  updatePatientContact(
    id_patient: number,
    contact: PatientContact
  ): Observable<PatientContact> {
    return this.http.put<PatientContact>(
      `${this.apiUrl}/${id_patient}/contact`,
      contact
    );
  }

  updatePatientConstraint(
    id_patient: number,
    constraint: PatientConstraint
  ): Observable<PatientConstraint> {
    return this.http.put<PatientConstraint>(
      `${this.apiUrl}/${id_patient}/constraint`,
      constraint
    );
  }

  deletePatient(id_patient: number): Observable<PatientInfo> {
    return this.http.delete<PatientInfo>(`${this.apiUrl}/${id_patient}`);
  }
}
