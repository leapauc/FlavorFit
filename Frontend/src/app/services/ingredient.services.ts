import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DistinctIngredient,
  IngredientByGroup,
  IngredientUnitWeight,
} from '../models/ingredient';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  private baseUrl = `http://localhost:3000/ingredient`;

  constructor(private http: HttpClient) {}

  /** GROUPES D'ALIMENTS */
  getAllGroups(): Observable<{ alim_grp_nom_fr: string }[]> {
    return this.http.get<{ alim_grp_nom_fr: string }[]>(
      `${this.baseUrl}/groups`,
    );
  }

  /** INGREDIENTS PAR GROUPE */
  getIngredientsByGroup(groupName: string): Observable<IngredientByGroup[]> {
    return this.http.get<IngredientByGroup[]>(
      `${this.baseUrl}/group/${encodeURIComponent(groupName)}`,
    );
  }

  getIngredientUnitWeight(
    idIngredient: number,
  ): Observable<IngredientUnitWeight> {
    return this.http.get<IngredientUnitWeight>(
      `${this.baseUrl}/${idIngredient}/unit_weight`,
    );
  }

  /** CONTENANTS DE MESURE */
  getMeasuringContainers(): Observable<{ name: string; weight: number }[]> {
    return this.http.get<{ name: string; weight: number }[]>(
      `${this.baseUrl}/measuring_contener`,
    );
  }

  getDistinctIngredient(): Observable<DistinctIngredient[]> {
    return this.http.get<DistinctIngredient[]>(
      `${this.baseUrl}/distinct_ingredient`,
    );
  }
}
