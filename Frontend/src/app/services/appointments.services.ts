import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id_appointment?: number;
  id_praticien: number;
  id_patient: number;
  lastname: string;
  firstname: string;
  date_appointment: string;
  duration: number;
  status?: string;
  notes?: string;
}

export interface AppointmentEdit {
  id_praticien: number;
  id_patient: number;
  date_appointment: string;
  duration: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private apiUrl = 'http://localhost:3000/rdv';

  constructor(private http: HttpClient) {}

  getByPraticien(id_praticien: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/praticien/${id_praticien}`,
    );
  }

  create(appointment: AppointmentEdit): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  update(id_appointment: number, appointment: AppointmentEdit) {
    return this.http.put(`${this.apiUrl}/${id_appointment}`, appointment);
  }

  delete(id_appointment: number) {
    return this.http.delete(`${this.apiUrl}/${id_appointment}`);
  }
}
