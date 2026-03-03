import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private apiUrl = 'http://localhost:3000/pdf';

  constructor(private http: HttpClient) {}

  generateReport(payload: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generate`, payload, {
      responseType: 'blob',
    });
  }
}
