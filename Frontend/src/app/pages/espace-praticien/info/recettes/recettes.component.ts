import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../../../services/recipe.services';
import { RecipePayload } from '../../../../models/recipe';

@Component({
  selector: 'app-recettes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recettes.component.html',
  styleUrl: './recettes.component.css',
})
export class RecettesComponent implements OnInit {
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
}
