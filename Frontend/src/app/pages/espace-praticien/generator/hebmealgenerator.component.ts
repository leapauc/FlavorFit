import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GetInfoFromDBService } from '../../../services/getInfoFromDB';
import {
  PathologyGroup,
  PathologyGroupUi,
} from '../../../models/pathologyGroup';
import { Conviction, Restriction } from '../../../models/infoDB';
import { IngredientService } from '../../../services/ingredient.services';
import { DistinctIngredient } from '../../../models/ingredient';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../../services/recipe.services';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PlanningService } from '../../../services/planning.services';
import { PdfService } from '../../../services/pdf.services';

interface ShoppingItem {
  name: string;
  quantity_g: number;
}

interface ShoppingList {
  [group: string]: ShoppingItem[];
}

@Component({
  selector: 'app-hebmealgenerator',
  imports: [CommonModule, FormsModule, DragDropModule],
  standalone: true,
  templateUrl: './hebmealgenerator.component.html',
  styleUrls: ['./hebmealgenerator.component.css'],
})
export class HebmealgeneratorComponent {
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as Node;

    // Vérifie si le clic est en dehors des menus déroulants et du champ autocomplete
    const dropdownElements = this.eRef.nativeElement.querySelectorAll(
      '.dropdown-menu, .autocomplete-container, .generator-dropdown',
    );
    let clickedInsideDropdown = false;

    dropdownElements.forEach((el: HTMLElement) => {
      if (el.contains(target)) {
        clickedInsideDropdown = true;
      }
    });

    if (!clickedInsideDropdown) {
      this.dropdownOpen = false;
      this.restrictionsDropdownOpen = false;
      this.resetIngredientSearch();
    }
  }

  dropListsIds: string[] = [];
  selectedRecipe: { id: string; title: string } | null = null;

  dropdownOpen = false;
  selectedPathologies: string[] = [];
  pathologyGroups: PathologyGroupUi[] = [];
  convictionGroups: string[] = [];
  selectedIngredients: { id: number; name: string }[] = [];
  ingredientDropdownOpen = false;
  @ViewChild('dateLabel') dateLabel!: ElementRef<HTMLLabelElement>;
  selectedConviction: string = '';
  Restrictions: string[] = [];
  selectedRestrictions: string[] = [];
  restrictionsDropdownOpen = false;

  days = ['Jour1', 'Jour2', 'Jour3', 'Jour4', 'Jour5', 'Jour6', 'Jour7'];
  meals = ['Midi', 'Dîner'];

  dateDebut: string = '';
  mode: 'auto' | 'manuel' = 'auto';

  filtersValidated = false;
  filtersSavedMessage = false;
  loadingRecipes = false;
  filteredRecipes: { id: string; title: string }[] = [];
  planningGenerated = false;

  // Structure pour stocker les recettes manuelles
  manualPlanning: Record<
    string,
    Record<string, { id: number; title: string } | null>
  > = {};

  ingredientGroups: { type: string; items: string[] }[] = [];

  mealsToPlan: Record<string, Record<string, boolean>> = {};

  allIngredients: { id: number; name: string }[] = [];
  filteredIngredients: { id: number; name: string }[] = [];
  ingredientSearch: string = '';

  shoppingList: ShoppingList = {};
  showShoppingList = false;
  shoppingListMode: 'auto' | 'manuel' | null = null;

  showPdfModal = false;
  pdfUrl: SafeResourceUrl | null = null;

  constructor(
    private getInfoFromDB: GetInfoFromDBService,
    private getIngredient: IngredientService,
    private recipeService: RecipeService,
    private planningService: PlanningService,
    private pdfService: PdfService,
    private eRef: ElementRef,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.loadPathologies();
    this.loadConviction();
    this.loadDistinctIngredient();
    this.loadRestrictions();

    // Initialisation du planning manuel
    this.days.forEach((day) => {
      // Initialise les repas à planifier
      this.mealsToPlan[day] = {};
      this.meals.forEach((meal) => {
        this.mealsToPlan[day][meal] = true; // valeur par défaut
      });

      // Initialise le planning manuel vide pour chaque jour et repas
      this.manualPlanning[day] = {};
      this.meals.forEach((meal) => {
        this.manualPlanning[day][meal] = null;
        this.dropListsIds.push(day + '-' + meal);
      });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const fpInstance = flatpickr('#dateDebut', {
        altInput: true,
        altFormat: 'j F Y',
        dateFormat: 'Y-m-d',
        locale: French,
        defaultDate: new Date(),
        allowInput: true,
        clickOpens: true,
        onChange: (selectedDates, dateStr) => {
          this.dateDebut = dateStr;
        },
      }) as flatpickr.Instance;

      if (this.dateLabel && fpInstance.altInput) {
        this.dateLabel.nativeElement.setAttribute(
          'for',
          fpInstance.altInput.id,
        );
      }
    }, 0);
  }

  // ------------------ Chargement des données ------------------
  loadPathologies() {
    this.getInfoFromDB.getPathologiesByType().subscribe({
      next: (data: PathologyGroup[]) => {
        this.pathologyGroups = data.map((group) => ({
          type: group.type,
          items: group.string_agg.split(',').map((item) => item.trim()),
        }));
      },
      error: (err) => console.error(err),
    });
  }
  loadRestrictions() {
    this.getInfoFromDB.getRestrictions().subscribe({
      next: (data: Restriction[]) => {
        this.Restrictions = data.map((c) => c.name);
      },
      error: (err) => console.error(err),
    });
  }

  loadConviction() {
    this.getInfoFromDB.getConvictions().subscribe({
      next: (data: Conviction[]) => {
        this.convictionGroups = data.map((c) => c.name);
      },
      error: (err) => console.error(err),
    });
  }

  loadDistinctIngredient(): void {
    this.getIngredient.getDistinctIngredient().subscribe({
      next: (data: DistinctIngredient[]) => {
        /* ------------------ 1️⃣ LISTE PLATE (AUTOCOMPLETE) ------------------ */
        this.allIngredients = data.map((i) => ({
          id: i.id_ingredient,
          name: i.alim_nom_fr,
        }));

        // Optionnel : supprimer doublons + trier
        this.allIngredients = Array.from(
          new Set(this.allIngredients.map((i) => JSON.stringify(i))),
        )
          .map((s) => JSON.parse(s))
          .sort((a, b) => a.name.localeCompare(b.name));

        this.filteredIngredients = [];

        /* ------------------ 2️⃣ GROUPING (OPTIONNEL / FUTUR) ------------------ */
        const grouped = data.reduce(
          (acc, item) => {
            const key = item.alim_ssgrp_nom_fr || 'Autres';
            if (!acc[key]) {
              acc[key] = { type: key, items: [] };
            }
            acc[key].items.push(item.alim_nom_fr);
            return acc;
          },
          {} as Record<string, { type: string; items: string[] }>,
        );

        this.ingredientGroups = Object.values(grouped);
      },
      error: (err) => console.error(err),
    });
  }

  filterIngredientAutocomplete() {
    if (!this.ingredientSearch) {
      this.filteredIngredients = [];
      return;
    }

    const term = this.ingredientSearch.toLowerCase();

    this.filteredIngredients = this.allIngredients
      .filter((i) => i.name.toLowerCase().includes(term))
      .slice(0, 20);
  }

  // ------------------ Validation & Reset ------------------
  validateFilters() {
    this.filtersValidated = true;
    this.filtersSavedMessage = true;
    this.loadingRecipes = true;

    // Récupération des recettes filtrées
    this.recipeService
      .getFilteredRecipes({
        excludedIngredients: this.selectedIngredients.map((i) => i.name),
      })
      .subscribe({
        next: (recipes: any[]) => {
          // Normaliser pour {id, name} si nécessaire
          this.filteredRecipes = recipes.map((r) => ({
            id: r.id_recipe,
            title: r.title,
          }));
          this.loadingRecipes = false;
        },
        error: (err) => {
          console.error(err);
          this.loadingRecipes = false;
        },
      });
  }

  resetFilters(): void {
    this.selectedPathologies = [];
    this.selectedIngredients = [];
    this.selectedRestrictions = [];
    this.dateDebut = '';

    this.filtersValidated = false;
    this.filtersSavedMessage = false;
    this.loadingRecipes = false;
    this.filteredRecipes = [];

    this.days.forEach((day) => {
      this.meals.forEach((meal) => {
        this.manualPlanning[day][meal] = null;
      });
    });
  }

  generateAutoPlanning() {
    if (!this.filtersValidated) {
      alert('Veuillez valider les filtres.');
      return;
    }

    this.loadingRecipes = true;

    // Récupérer les noms des convictions/restrictions sélectionnées
    const selectedConvictionNames = this.selectedConviction
      ? [this.selectedConviction]
      : [];
    const selectedRestrictionNames = this.selectedRestrictions;

    // Préparer le payload
    const payload = {
      excludedIngredients: this.selectedIngredients.map((i) => i.name),
      mealsToPlan: this.mealsToPlan,
      convictions: selectedConvictionNames, // Envoyer les noms des convictions
      restrictions: selectedRestrictionNames, // Envoyer les noms des restrictions
    };

    this.recipeService.generateAutoRecipes(payload).subscribe({
      next: (res) => {
        this.manualPlanning = res;
        this.loadingRecipes = false;
        this.planningGenerated = true;
      },
      error: (err) => {
        console.error(err);
        this.loadingRecipes = false;
      },
    });
  }

  // Mettre à jour resetFilters
  // resetFilters(): void {
  //   this.selectedPathologies = [];
  //   this.selectedIngredients = [];
  //   this.selectedRestrictions = [];
  //   this.selectedConviction = '';
  //   this.dateDebut = '';
  //   this.filtersValidated = false;
  //   this.filtersSavedMessage = false;
  //   this.loadingRecipes = false;
  //   this.filteredRecipes = [];
  //   this.days.forEach((day) => {
  //     this.meals.forEach((meal) => {
  //       this.manualPlanning[day][meal] = null;
  //     });
  //   });
  // }

  toggleMealRow(meal: string, checked: boolean) {
    this.days.forEach((day) => {
      this.mealsToPlan[day][meal] = checked;
    });
  }
  onToggleMealRow(event: Event, meal: string) {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.toggleMealRow(meal, input.checked);
    }
  }

  // Vérifie si tous les jours d’un repas sont cochés
  isMealRowChecked(meal: string): boolean {
    return this.days.every((day) => this.mealsToPlan[day][meal]);
  }
  // ------------------ Toggle & Sélections ------------------
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
    this.restrictionsDropdownOpen = false;
  }

  togglePathology(item: string) {
    if (this.filtersValidated) return;
    if (this.selectedPathologies.includes(item)) {
      this.selectedPathologies = this.selectedPathologies.filter(
        (p) => p !== item,
      );
    } else {
      this.selectedPathologies.push(item);
    }
  }

  removePathology(item: string) {
    if (this.filtersValidated) return;
    this.selectedPathologies = this.selectedPathologies.filter(
      (p) => p !== item,
    );
  }

  toggleIngredientDropdown(): void {
    this.ingredientDropdownOpen = !this.ingredientDropdownOpen;
    this.dropdownOpen = false; // Ferme les autres dropdowns
    this.restrictionsDropdownOpen = false;
  }

  toggleIngredient(ingredient: { id: number; name: string }): void {
    if (this.filtersValidated) return;
    const existing = this.selectedIngredients.find(
      (i) => i.id === ingredient.id,
    );
    if (existing) {
      this.selectedIngredients = this.selectedIngredients.filter(
        (i) => i.id !== ingredient.id,
      );
    } else {
      this.selectedIngredients.push(ingredient);
    }
    this.resetIngredientSearch();
  }

  removeIngredient(item: { id: number; name: string }): void {
    if (this.filtersValidated) return;
    this.selectedIngredients = this.selectedIngredients.filter(
      (i) => i.id !== item.id,
    );
  }

  resetIngredientSearch(): void {
    this.ingredientSearch = '';
    this.filteredIngredients = [];
  }

  onConvictionChange(): void {
    if (this.filtersValidated) return;
  }

  toggleRestrictionsDropdown(event: Event) {
    event.stopPropagation();
    this.restrictionsDropdownOpen = !this.restrictionsDropdownOpen;
    this.dropdownOpen = false;
  }

  // Méthode appelée lors du changement de restrictions
  toggleRestrictionsOption(option: string): void {
    if (this.filtersValidated) return;
    if (this.selectedRestrictions.includes(option)) {
      this.selectedRestrictions = this.selectedRestrictions.filter(
        (o) => o !== option,
      );
    } else {
      this.selectedRestrictions.push(option);
    }
  }

  // Méthode pour supprimer une restriction
  removeRestrictionsOption(option: string): void {
    if (this.filtersValidated) return;
    this.selectedRestrictions = this.selectedRestrictions.filter(
      (o) => o !== option,
    );
  }

  // ------------------ Planning manuel ------------------
  getRecipeOptions(day: string, meal: string): { id: string; title: string }[] {
    return [{ id: '', title: '-- Aucun --' }, ...this.filteredRecipes];
  }

  // ------------------ Utilitaires ------------------
  sanitizeId(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
  }

  // SWITCH MODE RESET
  setMode(mode: 'auto' | 'manuel') {
    this.mode = mode;

    // 🔥 Toujours cacher la liste de course au changement de mode
    this.showShoppingList = false;
    this.shoppingList = {};

    if (mode === 'manuel') {
      this.planningGenerated = false;
    }

    if (mode === 'auto') {
      this.planningGenerated = false;
      this.selectedRecipe = null;
    }
  }

  // DROP AREA
  onDrop(event: CdkDragDrop<any>, day: string, meal: string) {
    const recipe = event.item.data;
    if (recipe) {
      // Toujours copier dans un array
      this.manualPlanning[day][meal] = { ...recipe };
    }
    // On ne supprime pas selectedRecipe ici → le token reste dispo pour d'autres drops
  }

  removeMeal(day: string, meal: string) {
    this.manualPlanning[day][meal] = null;
  }
  compareRecipes(r1: any, r2: any): boolean {
    return r1 && r2 ? r1.id === r2.id : r1 === r2;
  }

  private getRecipeIdsFromPlanning(): number[] {
    const ids: number[] = [];

    Object.values(this.manualPlanning).forEach((day) => {
      Object.values(day).forEach((meal) => {
        if (meal?.id) {
          ids.push(meal.id);
        }
      });
    });

    return [...new Set(ids)];
  }

  /* ===============================
     GÉNÉRATION LISTE DE COURSE
  =============================== */

  generateShoppingList() {
    const recipeIds = this.getRecipeIdsFromPlanning();

    if (!recipeIds.length) {
      alert('Aucune recette sélectionnée');
      return;
    }

    this.planningService.generateShoppingList(recipeIds).subscribe({
      next: (data) => {
        this.shoppingList = data;
        this.showShoppingList = true;

        // 🔥 On mémorise le mode actuel
        this.shoppingListMode = this.mode;
      },
      error: (err) => console.error('ERREUR:', err),
    });
  }

  getSortedShoppingGroups(): { key: string; value: any[] }[] {
    if (!this.shoppingList) return [];

    const firstGroup1 = 'viandes, oeufs, poissons';
    const firstGroup2 = 'fruits, légumes, légumineuses et oléagineux';
    const lastGroup = 'aides culinaires et ingrédients divers';

    const groups = Object.keys(this.shoppingList).map((key) => ({
      key,
      value: this.shoppingList[key],
    }));

    return groups.sort((a, b) => {
      const aKey = a.key.toLowerCase().trim();
      const bKey = b.key.toLowerCase().trim();

      // 🥇 Les 2 premiers groupes
      if (aKey === firstGroup1) return -1;
      if (bKey === firstGroup1) return 1;

      if (aKey === firstGroup2) return -1;
      if (bKey === firstGroup2) return 1;

      // 🥉 Dernier groupe
      if (aKey === lastGroup) return 1;
      if (bKey === lastGroup) return -1;

      // 📚 Sinon ordre alphabétique
      return a.key.localeCompare(b.key);
    });
  }

  getGroupClass(groupName: string): string {
    const name = groupName.toLowerCase();

    if (
      name.includes('viandes') ||
      name.includes('oeufs') ||
      name.includes('poisson')
    ) {
      return 'group-red';
    }

    if (
      name.includes('fruits') ||
      name.includes('légumes') ||
      name.includes('legumes') ||
      name.includes('oléagineux') ||
      name.includes('legumineuses')
    ) {
      return 'group-green';
    }

    if (name.includes('eau') || name.includes('boisson')) {
      return 'group-blue';
    }

    if (
      name.includes('matières grasses') ||
      name.includes('matieres grasses')
    ) {
      return 'group-orange';
    }

    if (name.includes('céréaliers') || name.includes('cerealiers')) {
      return 'group-brown';
    }

    if (name.includes('laitiers')) {
      return 'group-black';
    }

    if (name.includes('sucrés') || name.includes('sucres')) {
      return 'group-pink';
    }

    if (name.includes('aides culinaires')) {
      return 'group-purple';
    }

    return 'group-default';
  }

  /* ===============================
     AFFICHAGE UTILISABLE
  =============================== */

  trackByString(index: number, item: any) {
    return item;
  }

  trackByPathologyGroup(index: number, item: PathologyGroupUi) {
    return item.type;
  }

  trackByGroup(index: number, item: any) {
    return item.key;
  }

  // GENERATE PLANNING PDF
  // generatePdf() {
  //   // On cible la div qui contient le planning et la liste de course
  //   const content = document.getElementById('planning-pdf');

  //   if (!content) {
  //     console.error('Contenu PDF non trouvé');
  //     return;
  //   }

  //   // Créer un nouveau PDF A4
  //   const doc = new jsPDF('p', 'mm', 'a4');

  //   // Ajouter le logo en haut (tu peux mettre un chemin relatif ou base64)
  //   const logo = new Image();
  //   logo.src = '/img/logo_flavorFit.webp'; // Chemin relatif à public
  //   logo.onload = () => {
  //     doc.addImage(logo, 'WEBP', 10, 10, 10, 10); // x, y, largeur, hauteur

  //     // Transformer le HTML en canvas
  //     html2canvas(content, { scale: 2 }).then((canvas) => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pageWidth = doc.internal.pageSize.getWidth();
  //       const pageHeight = doc.internal.pageSize.getHeight();

  //       // Calculer la largeur et hauteur pour garder les proportions
  //       const imgProps = doc.getImageProperties(imgData);
  //       const pdfWidth = pageWidth - 20; // marges
  //       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //       doc.addImage(imgData, 'PNG', 10, 40, pdfWidth, pdfHeight);
  //       doc.save('planning_repas.pdf');
  //     });
  //   };
  // }

  generatePdf() {
    const payload = {
      constraints: {
        nbPersons: 2,
        startDate: this.dateDebut,
        pathologies: this.selectedPathologies,
        restrictions: this.selectedRestrictions,
        ingredientsExcluded: this.selectedIngredients,
      },
      planning: this.manualPlanning,
      shoppingList: this.shoppingList,
    };

    this.pdfService.generateReport(payload).subscribe((pdf: Blob) => {
      const url = window.URL.createObjectURL(pdf);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.showPdfModal = true;
    });
  }

  closePdfModal() {
    this.showPdfModal = false;
    this.pdfUrl = null;
  }
}
