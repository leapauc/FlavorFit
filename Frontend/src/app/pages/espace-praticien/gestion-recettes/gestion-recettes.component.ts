import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddRecetteModalComponent } from './add-recette-modal/add-recette-modal.component';
import { GlobalNotificationComponent } from '../../../components/global-notification/global-notification.component';

import { RecipePayload } from '../../../models/recipe';
import { RecipeService } from '../../../services/recipe.services';
import { ModifyRecetteModalComponent } from './modify-recette-modal/modify-recette-modal.component';
import { AuthUser } from '../../../models/authUser';
import { AuthService } from '../../../services/auth.services';
import { NotificationService } from '../../../services/notification.services';

@Component({
  selector: 'app-gestion-recettes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddRecetteModalComponent,
    ModifyRecetteModalComponent,
    GlobalNotificationComponent,
  ],
  templateUrl: './gestion-recettes.component.html',
  styleUrls: ['./gestion-recettes.component.css'],
})
export class GestionRecettesComponent implements OnInit {
  isAddModalOpen = false;
  isEditModalOpen = false;
  recipes: RecipePayload[] = [];
  selectedRecipeId?: number; // recette sélectionnée pour suppression
  showDeleteConfirm = false;
  notificationMessage = ''; // message à afficher
  notificationType: 'success' | 'error' = 'success';
  authUser: AuthUser | null = null;

  // recherche
  searchTerm: string = '';

  // pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.authUser = this.authService.getUser();
    this.loadRecipes(this.authUser!.id_praticien);
  }

  onRecipeCreated(recipe: any) {
    this.recipes.unshift(recipe); // ajout instantané
  }
  loadRecipes(id_praticien: number): void {
    this.recipeService.getRecipesByPraticien(id_praticien).subscribe({
      next: (res) => {
        this.recipes = res;
      },
      error: (err) => console.error(err),
    });
  }

  get filteredRecipes(): RecipePayload[] {
    if (!this.searchTerm) {
      return this.recipes;
    }

    const term = this.searchTerm.toLowerCase();

    return this.recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(term) ||
        recipe.categorie?.toLowerCase().includes(term),
    );
  }

  get paginatedRecipes(): RecipePayload[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecipes.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRecipes.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  /**/
  openAddModal(): void {
    this.isAddModalOpen = true;
  }
  /**/
  openEditModal(id_recipe: number) {
    this.selectedRecipeId = id_recipe;
    this.isEditModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  confirmDelete(id_recipe?: number): void {
    if (!id_recipe) return;
    this.selectedRecipeId = id_recipe;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.selectedRecipeId = undefined;
    this.showDeleteConfirm = false;
  }

  deleteRecipe(): void {
    if (!this.selectedRecipeId) return;

    this.recipeService.deleteRecipe(this.selectedRecipeId).subscribe({
      next: () => {
        this.recipes = this.recipes.filter(
          (r) => r.id_recipe !== this.selectedRecipeId,
        );

        this.notificationService.show(
          'Recette supprimée avec succès !',
          'success',
        );

        this.cancelDelete();
      },
      error: (err) => {
        console.error(err);

        this.notificationService.show(
          'Impossible de supprimer la recette.',
          'error',
        );
      },
    });
  }
}
