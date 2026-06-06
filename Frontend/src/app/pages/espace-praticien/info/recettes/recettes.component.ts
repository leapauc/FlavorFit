import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../../../services/recipe.services';
import { RecipePayload } from '../../../../models/recipe';
import { CustomNumberPipe } from '../../../../pipes/customNumber';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFire,
  faDrumstickBite,
  faWheatAwn,
  faDroplet,
  faLeaf,
  faCube,
  faBottleWater,
  faOilCan,
  faHeartPulse,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-recettes',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomNumberPipe, FontAwesomeModule],
  templateUrl: './recettes.component.html',
  styleUrl: './recettes.component.css',
})
export class RecettesComponent implements OnInit {
  faFire = faFire;
  faProtein = faDrumstickBite;
  faCarbs = faWheatAwn;
  faFat = faDroplet;
  faFiber = faLeaf;
  faSugar = faCube;
  faSalt = faBottleWater;
  faSaturatedFat = faOilCan;
  faCholesterol = faHeartPulse;

  recipes: any[] = [];
  filteredRecipes: any[] = [];

  search = '';

  selectedRecipe: RecipePayload | null = null;

  showModal = false;

  constructor(private recipeService: RecipeService) {}

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipeService.getAllRecipes().subscribe((data) => {
      this.recipes = data;
      this.filteredRecipes = data;
    });
  }

  filterRecipes() {
    const value = this.search.toLowerCase();

    this.filteredRecipes = this.recipes.filter((r) =>
      r.title.toLowerCase().includes(value),
    );
  }

  viewRecipe(id_recipe: number) {
    this.recipeService.getAllInfoRecipeById(id_recipe).subscribe((recipe) => {
      this.selectedRecipe = recipe;
      console.log(this.selectedRecipe);
      this.showModal = true;
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedRecipe = null;
  }

  formatSteps(description: string | string[] | undefined): string[] {
    if (description == null) return [];

    // Si c'est déjà un tableau valide
    if (Array.isArray(description) && description.length > 0) {
      return description
        .map((step) => (typeof step === 'string' ? step.trim() : ''))
        .filter((step) => step.length > 0);
    }

    // Si c'est une chaîne de caractères
    if (typeof description === 'string') {
      // Essayer d'abord avec une expression régulière plus précise
      const steps = description
        .split(/[\n\r]-|-\s|–\s|—\s|•\s|\*\s|\d+\.\s/)
        .map((step) => step.trim())
        .filter((step) => step.length > 0);

      // Si on n'a qu'une seule étape mais qu'elle contient clairement des séparateurs
      if (steps.length === 1) {
        const singleStep = steps[0];
        // Vérifier si c'est une liste numérotée (1. 2. 3.)
        if (/\d+\.\s/.test(singleStep)) {
          return singleStep
            .split(/\d+\.\s/)
            .filter((step) => step.trim().length > 0);
        }
        // Sinon essayer avec une séparation plus agressive
        return singleStep
          .split(/[-–—•*]\s*|\n\s*/)
          .map((step) => step.trim())
          .filter((step) => step.length > 0);
      }

      return steps;
    }

    return [];
  }

  hasValidSteps(): boolean {
    return this.formatSteps(this.selectedRecipe?.description).length > 0;
  }

  getValue(value: number | undefined): string {
    return value !== undefined && value !== null ? value.toString() : '0';
  }

  getRecipeImageUrl(imgUrl?: string): string {
    if (!imgUrl || imgUrl.trim().length === 0) {
      return 'assets/recipe-placeholder.png';
    }

    const trimmedUrl = imgUrl.trim();
    if (trimmedUrl.startsWith('//')) {
      return `https:${trimmedUrl}`;
    }

    return trimmedUrl;
  }

  // Méthode pour convertir kcal en kJ
  getKj(kcal: number | undefined): string {
    return kcal ? (kcal * 4.184).toFixed(0) : '0';
  }
}
