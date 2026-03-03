import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RecipeService } from '../../../../services/recipe.services';
import { IngredientService } from '../../../../services/ingredient.services';
import { AuthService } from '../../../../services/auth.services';

import { AuthUser } from '../../../../models/authUser';
import {
  IngredientUnitWeight,
  MeasuringContainer,
} from '../../../../models/ingredient';
import { NotificationService } from '../../../../services/notification.services';

@Component({
  selector: 'add-recette-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-recette-modal.component.html',
  styleUrls: ['./add-recette-modal.component.css'],
})
export class AddRecetteModalComponent implements OnInit {
  categories: { categorie: string }[] = [];
  difficulties: { difficulty: string }[] = [];
  prices: { price: string }[] = [];
  ecoscores: { ecoscore: string }[] = [];
  ingredientGroups: { alim_grp_nom_fr: string }[] = [];

  recipeMode: 'text' | 'url' = 'text';
  authUser: AuthUser | null = null;

  recipe = {
    title: '',
    categorie: '',
    servings: null as number | null,
    prepTime: null as number | null,
    difficulty: '',
    price: '',
    ecoscore: '',
    description: '',
    url: '',
  };

  ingredients: {
    group?: string;
    ingredient?: {
      id_ingredient: number;
      alim_nom_fr: string;
      alim_grp_nom_fr?: string;
      alim_ssgrp_nom_fr?: string;
      alim_ssssgrp_nom_fr?: string;
    };
    quantity?: number | null;
    unit?: string;
    unitWeight?: number | null;
    availableIngredients?: { id_ingredient: number; alim_nom_fr: string }[];
    availableUnits?: string[];
    availableContainers?: MeasuringContainer[];
  }[] = [];

  modalErrorMessage: string = '';

  formSubmitted: boolean = false;

  @Output() created = new EventEmitter<any>();

  constructor(
    private recipeService: RecipeService,
    private ingredientService: IngredientService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.authUser = this.authService.getUser();
    this.loadSelectData();
    this.addIngredient();
  }

  private loadSelectData(): void {
    this.recipeService.getCategories().subscribe((r) => (this.categories = r));
    this.recipeService
      .getDifficultyLevels()
      .subscribe((r) => (this.difficulties = r));
    this.recipeService.getPriceLevels().subscribe((r) => (this.prices = r));
    this.recipeService
      .getEcoscoreLevels()
      .subscribe((r) => (this.ecoscores = r));
    this.ingredientService
      .getAllGroups()
      .subscribe((r) => (this.ingredientGroups = r));
  }

  private isLiquidOrSpecialIngredient(
    ingredient: any,
    group?: string,
  ): boolean {
    console.log('INGREDIENT SELECTED', ingredient);
    console.log('GROUP RAW:', JSON.stringify(group));
    return (
      [
        'eaux et autres boissons',
        'matières grasses',
        'aides culinaires et ingrédients divers',
      ].includes(group ?? '') ||
      ingredient?.alim_ssssgrp_nom_fr === 'fromages blancs' ||
      ['laits', 'crèmes et spécialités à base de crème'].includes(
        ingredient?.alim_ssgrp_nom_fr,
      )
    );
  }

  /** INGREDIENT MANAGEMENT */
  addIngredient(): void {
    this.ingredients.push({
      group: '',
      ingredient: undefined,
      quantity: null,
      unit: '',
      unitWeight: null,
      availableIngredients: [],
      availableUnits: ['g', 'kg'],
      availableContainers: [], // ➕
    });
  }

  removeIngredient(index: number): void {
    this.ingredients.splice(index, 1);
  }

  onGroupChange(index: number): void {
    const ing = this.ingredients[index];

    if (!ing.group) {
      this.resetIngredient(index);
      return;
    }

    this.ingredientService.getIngredientsByGroup(ing.group).subscribe((res) => {
      ing.availableIngredients = res;
      this.resetIngredient(index);
      ing.group = ing.group;
    });
  }

  onUnitChange(index: number): void {
    const ing = this.ingredients[index];
    if (!ing.unit) return;

    if (ing.unit === 'g') ing.unitWeight = 1;
    else if (ing.unit === 'kg') ing.unitWeight = 1000;
    else if (ing.unit === 'pièce') return;
    else {
      const container = ing.availableContainers?.find(
        (c) => c.name === ing.unit,
      );
      if (container) ing.unitWeight = container.weight;
    }
  }

  onIngredientChange(index: number): void {
    const ing = this.ingredients[index];

    ing.quantity = null;
    ing.unit = '';
    ing.unitWeight = null;
    ing.availableUnits = ['g', 'kg'];
    ing.availableContainers = [];

    if (!ing.ingredient || !ing.ingredient.id_ingredient) return;

    // 🔹 EXISTANT : poids pièce
    this.ingredientService
      .getIngredientUnitWeight(ing.ingredient.id_ingredient)
      .subscribe({
        next: (res: IngredientUnitWeight) => {
          if (res.statut === 'OK' && res.poids_unitaire) {
            ing.unitWeight = res.poids_unitaire;
            ing.availableUnits!.push('pièce');
          }
        },
      });

    // 🔹 NOUVEAU : contenants
    if (this.isLiquidOrSpecialIngredient(ing.ingredient, ing.group ?? '')) {
      this.ingredientService
        .getMeasuringContainers()
        .subscribe((containers) => {
          ing.availableContainers = containers;

          ing.availableUnits!.push(...containers.map((c) => c.name));

          // sécurité doublons
          ing.availableUnits = Array.from(new Set(ing.availableUnits));
        });
    }
  }

  private resetIngredient(index: number): void {
    const ing = this.ingredients[index];
    ing.ingredient = undefined;
    ing.quantity = null;
    ing.unit = '';
    ing.unitWeight = null;
    ing.availableUnits = ['g', 'kg'];
    ing.availableContainers = []; // ➕
  }

  /** VALIDATION */
  isIngredientComplete(ing: any): boolean {
    return !!ing.group && !!ing.ingredient && !!ing.quantity && !!ing.unit;
  }

  isFormValid(): boolean {
    const basicFields =
      !!this.recipe.title &&
      !!this.recipe.categorie &&
      !!this.recipe.servings &&
      !!this.recipe.prepTime &&
      !!this.recipe.difficulty &&
      !!this.recipe.price &&
      !!this.recipe.ecoscore;

    const hasCompleteIngredient = this.ingredients.some((i) =>
      this.isIngredientComplete(i),
    );

    return basicFields && hasCompleteIngredient;
  }

  getFieldClass(value: any): string {
    return value ? 'is-valid' : 'is-invalid';
  }

  /** SUBMIT */
  submit(): void {
    if (!this.authUser) return;

    // Vérification complète avant submit
    let incomplete = false;

    // Vérifie les champs de recette
    const requiredRecipeFields = [
      'title',
      'categorie',
      'servings',
      'prepTime',
      'difficulty',
      'price',
      'ecoscore',
    ] as const;
    requiredRecipeFields.forEach((f) => {
      if (!this.recipe[f]) incomplete = true;
    });

    // Vérifie les ingrédients
    if (!this.ingredients.some((i) => this.isIngredientComplete(i))) {
      incomplete = true;
    }

    const payload = {
      ...this.recipe,
      id_praticien: this.authUser.id_praticien,
      servings: this.recipe.servings ?? 0,
      prepTime: this.recipe.prepTime ?? 0,
      ingredients: this.ingredients
        .filter((i) => this.isIngredientComplete(i))
        .map((i) => {
          const originalQuantity = i.quantity ?? 0;
          const originalUnit = i.unit ?? '';

          let quantityInGrams = originalQuantity;

          if (originalUnit === 'kg') {
            quantityInGrams = originalQuantity * 1000;
          } else if (originalUnit === 'pièce' && i.unitWeight) {
            quantityInGrams = originalQuantity * i.unitWeight;
          } else {
            const container = i.availableContainers?.find(
              (c) => c.name === originalUnit,
            );
            if (container) {
              quantityInGrams = originalQuantity * container.weight;
            }
          }

          return {
            name: i.ingredient!.alim_nom_fr,

            // 👇 CE QUE L'UTILISATEUR A SAISI
            quantity: originalQuantity,
            unit: originalUnit,

            // 👇 POUR STOCKAGE NUTRITIONNEL
            unit_g: quantityInGrams,
          };
        }),
      description: this.recipeMode === 'text' ? [this.recipe.description] : [],
    };

    this.recipeService.createRecipe(payload).subscribe({
      next: (createdRecipe) => {
        this.notificationService.show('Recette créée avec succès !', 'success');
        this.created.emit(createdRecipe);
        this.closeModal();
      },
      error: () =>
        this.notificationService.show(
          'Erreur lors de la création de la recette',
          'error',
        ),
    });
  }

  /** MODAL */
  @Output() close = new EventEmitter<void>();
  closeModal(): void {
    this.close.emit();
  }
}
