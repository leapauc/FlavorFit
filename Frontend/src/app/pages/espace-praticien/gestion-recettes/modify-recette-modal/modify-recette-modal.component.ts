import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../../../services/recipe.services';
import { IngredientService } from '../../../../services/ingredient.services';
import { AuthService } from '../../../../services/auth.services';
import { AuthUser } from '../../../../models/authUser';
import { NotificationService } from '../../../../services/notification.services';
import { IngredientUI } from '../../../../models/ingredient';

@Component({
  selector: 'modify-recette-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modify-recette-modal.component.html',
  styleUrls: ['./modify-recette-modal.component.css'],
})
export class ModifyRecetteModalComponent implements OnInit {
  @Input() id_recipe!: number;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  authUser: AuthUser | null = null;

  categories: { categorie: string }[] = [];
  difficulties: { difficulty: string }[] = [];
  prices: { price: string }[] = [];
  ecoscores: { ecoscore: string }[] = [];
  ingredientGroups: { alim_grp_nom_fr: string }[] = [];

  recipeMode: 'text' | 'url' = 'text';
  formSubmitted: boolean = false;

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

  ingredients: IngredientUI[] = [];

  constructor(
    private recipeService: RecipeService,
    private ingredientService: IngredientService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.authUser = this.authService.getUser();
    this.loadSelectData();
    if (this.id_recipe) {
      this.loadRecipe();
    } else {
      this.addIngredient();
    }
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

  loadRecipe(): void {
    this.recipeService.getAllInfoRecipeById(this.id_recipe).subscribe({
      next: (res) => {
        // ---- recette ----
        this.recipe = {
          title: res.title,
          categorie: res.categorie,
          servings: res.servings,
          prepTime: res.prepTime,
          difficulty: res.difficulty,
          price: res.price,
          ecoscore: res.ecoscore,
          description: Array.isArray(res.description)
            ? res.description.join('\n')
            : '',
          url: res.url ?? '',
        };

        this.recipeMode = res.url ? 'url' : 'text';

        // ---- ingrédients UI ----
        this.ingredients = res.ingredients.map((apiIng: any) => {
          const uiIng: IngredientUI = {
            group: apiIng.alim_grp_nom_fr,
            ingredient: undefined, // on le mettra après
            quantity: apiIng.quantity,
            unit: apiIng.unit,
            availableIngredients: [],
            availableUnits: ['g', 'kg', 'pièce'],
          };

          // charger les ingrédients du groupe
          this.ingredientService
            .getIngredientsByGroup(apiIng.alim_grp_nom_fr)
            .subscribe((groupIngredients: any[]) => {
              uiIng.availableIngredients = groupIngredients.map((g) => ({
                id_ingredient: g.id_ingredient,
                alim_nom_fr: g.alim_nom_fr,
              }));

              // sélectionner l’ingrédient correspondant à la recette
              const selected = uiIng.availableIngredients.find(
                (x) => x.alim_nom_fr === apiIng.name,
              );

              if (selected) {
                uiIng.ingredient = selected;

                // 🔥 appliquer la logique métier même en modification
                const idx = this.ingredients.indexOf(uiIng);
                this.applyUnitRules(idx);
              }
            });

          return uiIng;
        });
      },
      error: console.error,
    });
  }

  addIngredient(): void {
    this.ingredients.push({
      group: '',
      ingredient: undefined,
      quantity: undefined,
      unit: '',
      availableIngredients: [],
      availableUnits: ['g', 'kg'],
      availableContainers: [],
    });
  }

  removeIngredient(index: number): void {
    this.ingredients.splice(index, 1);
  }

  onGroupChange(index: number): void {
    this.loadAvailableIngredients(index);
    this.resetIngredient(index, false);
  }

  private loadAvailableIngredients(index: number): void {
    const ing = this.ingredients[index];
    if (!ing.group) return;

    this.ingredientService
      .getIngredientsByGroup(ing.group)
      .subscribe((res: any[]) => {
        ing.availableIngredients = res.map((i) => ({
          id_ingredient: i.id_ingredient,
          alim_nom_fr: i.alim_nom_fr,
        }));
        if (
          ing.ingredient &&
          !ing.availableIngredients.find(
            (x) => x.id_ingredient === ing.ingredient?.id_ingredient,
          )
        ) {
          ing.ingredient = undefined;
        }
      });
  }
  private isLiquidOrSpecialIngredient(
    ingredient: any,
    group?: string,
  ): boolean {
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

  onIngredientChange(index: number): void {
    const ing = this.ingredients[index];
    ing.quantity = undefined;
    ing.unit = '';
    this.applyUnitRules(index);
  }

  private resetIngredient(index: number, clearGroup = true): void {
    const ing = this.ingredients[index];
    if (clearGroup) ing.group = '';
    ing.ingredient = undefined;
    ing.quantity = undefined;
    ing.unit = '';
    ing.availableIngredients = [];
    ing.availableUnits = ['g', 'kg'];
  }
  private applyUnitRules(index: number): void {
    const ing = this.ingredients[index];

    // ✅ Assurer que les arrays existent
    ing.availableUnits = ing.availableUnits || ['g', 'kg'];
    ing.availableContainers = ing.availableContainers || [];
    ing.unitWeight = undefined;

    if (!ing.ingredient?.id_ingredient) return;

    // 🔹 poids pièce
    this.ingredientService
      .getIngredientUnitWeight(ing.ingredient.id_ingredient)
      .subscribe((res) => {
        if (res.statut === 'OK' && res.poids_unitaire) {
          ing.unitWeight = res.poids_unitaire;
          ing.availableUnits!.push('pièce'); // plus d'erreur
        }
      });

    // 🔹 contenants pour certains groupes
    if (this.isLiquidOrSpecialIngredient(ing.ingredient, ing.group)) {
      this.ingredientService
        .getMeasuringContainers()
        .subscribe((containers) => {
          ing.availableContainers = containers;
          ing.availableUnits!.push(...containers.map((c) => c.name));
          ing.availableUnits = Array.from(new Set(ing.availableUnits)); // éviter doublons
        });
    }
  }

  isIngredientComplete(ing: IngredientUI): boolean {
    return (
      !!ing.group &&
      !!ing.ingredient &&
      ing.quantity !== null &&
      ing.quantity !== undefined &&
      ing.unit !== ''
    );
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

    const ingredientsOk = this.ingredients.every((i) =>
      this.isIngredientComplete(i),
    );

    return basicFields && ingredientsOk;
  }

  onDescriptionChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.recipe.description = textarea.value;
  }

  formatDescriptionToArray(description: string): string[] {
    // Séparer par les sauts de ligne
    const lines = description.split('\n');

    // Filtrer les lignes vides et nettoyer
    const cleanedLines = lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Si les lignes commencent par '- ', les nettoyer
    return cleanedLines.map((line) => {
      if (
        line.startsWith('- ') ||
        line.startsWith('– ') ||
        line.startsWith('— ')
      ) {
        return line.substring(2).trim();
      }
      return line;
    });
  }

  submit(): void {
    if (!this.authUser) return;

    let formattedDescription: string[] = [];
    if (this.recipeMode === 'text') {
      if (typeof this.recipe.description === 'string') {
        formattedDescription = this.formatDescriptionToArray(
          this.recipe.description,
        );
      } else if (Array.isArray(this.recipe.description)) {
        formattedDescription = this.recipe.description;
      }
    }
    const payload = {
      ...this.recipe,
      id_praticien: this.authUser!.id_praticien,
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

      description: formattedDescription,
      url: this.recipeMode === 'url' ? this.recipe.url : '',
    };

    this.recipeService.updateRecipe(this.id_recipe, payload).subscribe({
      next: () => {
        this.notificationService.show(
          'Recette modifiée avec succès !',
          'success',
        );
        this.updated.emit();
        this.closeModal();
      },
      error: () =>
        this.notificationService.show(
          'Erreur lors de la modification de la recette',
          'error',
        ),
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  /** Optionnel : fonction de style pour ngClass */
  getFieldClass(value: any): string {
    return value ? 'is-valid' : 'is-invalid';
  }
}
