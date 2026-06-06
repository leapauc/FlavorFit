import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecipePayload } from '../models/recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private baseUrl = 'http://localhost:3000/recipe';
  constructor(private http: HttpClient) {}

  /** CATÉGORIES */
  getCategories(): Observable<{ categorie: string }[]> {
    return this.http.get<{ categorie: string }[]>(
      `${this.baseUrl}/category_recipe`,
    );
  }

  /** DIFFICULTÉS */
  getDifficultyLevels(): Observable<{ difficulty: string }[]> {
    return this.http.get<{ difficulty: string }[]>(
      `${this.baseUrl}/difficulty`,
    );
  }

  /** PRIX */
  getPriceLevels(): Observable<{ price: string }[]> {
    return this.http.get<{ price: string }[]>(`${this.baseUrl}/price`);
  }

  /** ECOSCORE */
  getEcoscoreLevels(): Observable<{ ecoscore: string }[]> {
    return this.http.get<{ ecoscore: string }[]>(`${this.baseUrl}/ecoscore`);
  }

  /** CRÉER UNE RECETTE */
  createRecipe(
    recipe: RecipePayload,
  ): Observable<{ id_recipe: number; nutrition: any }> {
    return this.http.post<{ id_recipe: number; nutrition: any }>(
      `${this.baseUrl}`,
      recipe,
    );
  }
  getAllRecipes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  /** 🔹 NOUVEAU - RECUPÉRER LES RECETTES D’UN PRATICIEN */
  getRecipesByPraticien(id_praticien: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by_praticien/${id_praticien}`);
  }

  getAllInfoRecipeById(id_recipe: number): Observable<RecipePayload> {
    return this.http.get<RecipePayload>(
      `${this.baseUrl}/${id_recipe}/all_info_recipe`,
    );
  }

  updateRecipe(
    id_recipe: number,
    recipe: RecipePayload,
  ): Observable<{ message: string; nutrition: any }> {
    return this.http.put<{ message: string; nutrition: any }>(
      `${this.baseUrl}/${id_recipe}`,
      recipe,
    );
  }

  /** 🔹 NOUVEAU - SUPPRIMER UNE RECETTE */
  deleteRecipe(id_recipe: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id_recipe}`);
  }

  getFilteredRecipes(payload: {
    excludedIngredients: string[];
    convictions?: string[];
    restrictions?: string[];
  }): Observable<RecipePayload[]> {
    console.log('POST vers:', `${this.baseUrl}/filtered`);
    console.log('Payload envoyé:', payload);
    return this.http.post<RecipePayload[]>(`${this.baseUrl}/filtered`, payload);
  }
  generateAutoRecipes(payload: {
    excludedIngredients: string[];
    mealsToPlan: Record<string, Record<string, boolean>>;
    convictions?: string[];
    restrictions?: string[];
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auto_planning`, payload);
  }
}
