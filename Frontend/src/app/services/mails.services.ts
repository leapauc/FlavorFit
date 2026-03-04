import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private apiUrl = 'http://localhost:3000/mail';

  constructor(private http: HttpClient) {}

  sendPlanningEmail(payload: {
    email: string;
    firstName: string;
    lastName: string;
    startDate: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-planning-email`, payload);
  }
}
