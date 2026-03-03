import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PathologyGroup } from '../models/pathologyGroup';
import { Conviction, Restriction } from '../models/infoDB';
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
export class GetInfoFromDBService {
  getDistinctIngredient() {
    throw new Error('Method not implemented.');
  }
  /**
   * URL de base de l'API utilisée pour les appels d'authentification.
   */
  private apiUrl = 'http://localhost:3000/bdd_info';

  /**
   * Crée une instance de  AuthService.
   * @param http Service Angular pour effectuer des requêtes HTTP.
   */
  constructor(private http: HttpClient) {}

  getPathologiesByType(): Observable<PathologyGroup[]> {
    return this.http.get<PathologyGroup[]>(`${this.apiUrl}/pathologies`);
  }

  getConvictions(): Observable<Conviction[]> {
    return this.http.get<Conviction[]>(`${this.apiUrl}/convictions`);
  }

  getRestrictions(): Observable<Restriction[]> {
    return this.http.get<Restriction[]>(`${this.apiUrl}/restrictions`);
  }

  getFruitVegetablesWeight(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fruit_vegetable_weight`);
  }

  getMeatFishEggWeight(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meat_fish_egg_weight`);
  }
}
