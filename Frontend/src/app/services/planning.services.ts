import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private apiUrl = 'http://localhost:3000/planning';

  constructor(private http: HttpClient) {}

  getPlanningByPatient(idPatient: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${idPatient}`);
  }

  savePlanning(idPatient: number, payload: any) {
    return this.http.post(`${this.apiUrl}/${idPatient}`, payload);
  }

  getPlanningDetails(id_planning: number) {
    return this.http.get<any>(`${this.apiUrl}/${id_planning}/details`);
  }

  deletePlanning(id_planning: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id_planning}`);
  }

  generateShoppingList(recipeIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recipe/shopping_list`, {
      recipeIds,
    });
  }
}
