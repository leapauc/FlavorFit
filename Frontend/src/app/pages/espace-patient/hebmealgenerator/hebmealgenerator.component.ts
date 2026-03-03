import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { RecipeService } from '../../../services/recipe.services';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PatientService } from '../../../services/patient.services';
import { PlanningService } from '../../../services/planning.services';
@Component({
  selector: 'app-hebmealgenerator',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './hebmealgenerator.component.html',
  styleUrls: ['./hebmealgenerator.component.css'],
})
export class HebmealgeneratorPatientComponent {
  dropListsIds: string[] = [];
  selectedRecipe: { id: string; title: string } | null = null;
  loadingRecipes = false;

  selectedPathologies: string[] = [];
  ingredientDropdownOpen = false;
  @ViewChild('dateLabel') dateLabel!: ElementRef<HTMLLabelElement>;

  dietaryOptions: string[] = [
    'Sans gluten',
    'Sans lactose',
    'Sans oléagineux',
    'Sans œuf',
    'Sans poisson',
    'Sans fruits de mer',
    'Sans légumineuses',
    'Sans ail / oignon',
  ];
  selectedDietaryOptions: string[] = [];
  dietaryDropdownOpen = false;

  days = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];
  meals = ['Midi', 'Dîner'];

  dateDebut: string = '';
  mode: 'auto' | 'manuel' = 'auto';

  filtersValidated = false;
  filtersSavedMessage = false;
  filteredRecipes: { id: string; title: string }[] = [];
  planningGenerated = false;

  // Structure pour stocker les recettes manuelles
  manualPlanning: Record<
    string,
    Record<string, { id: number; title: string } | null>
  > = {};

  ingredientGroups: { type: string; items: string[] }[] = [];

  mealsToPlan: Record<string, Record<string, boolean>> = {};

  patientAllergies: string[] = [];
  selectedPatientId!: number;

  constructor(
    private recipeService: RecipeService,
    private patientService: PatientService,
    private planningService: PlanningService,
  ) {}

  ngOnInit() {
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
    const patient = this.patientService.getSelectedPatient();
    if (patient) {
      this.selectedPatientId = patient.id_patient;
      this.loadPatientAllergies(this.selectedPatientId);
    }
    console.log('Patient sélectionné:', patient);
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

  loadPatientAllergies(id_patient: number) {
    this.patientService.getPatientById(id_patient).subscribe({
      next: (patient) => {
        this.patientAllergies = patient.allergies || [];

        this.validateFilters();
      },
      error: (err) => console.error(err),
    });
  }

  validateFilters() {
    this.loadingRecipes = true;

    // Combiner les ingrédients exclus par l'utilisateur et les allergies du patient
    const excludedIngredients = [...this.patientAllergies];

    // Récupération des recettes filtrées via le service
    this.recipeService.getFilteredRecipes({ excludedIngredients }).subscribe({
      next: (recipes: any[]) => {
        // Normaliser pour {id, title} si nécessaire
        this.filteredRecipes = recipes.map((r) => ({
          id: r.id_recipe,
          title: r.title,
          ingredients: r.ingredients || [], // si tu veux garder la liste pour d'autres filtres
        }));

        this.loadingRecipes = false;
      },
      error: (err) => {
        console.error('Erreur récupération recettes :', err);
        this.loadingRecipes = false;
      },
    });
  }

  /*GENERATE AUTO PLANNING*/
  generateAutoPlanning() {
    this.loadingRecipes = true;

    // Préparer la structure pour indiquer les repas à prévoir
    // Exemple : { Lundi: { Midi: true, Dîner: false }, ... }
    const mealsToPlan: Record<string, Record<string, boolean>> = {};
    this.days.forEach((day) => {
      mealsToPlan[day] = {};
      this.meals.forEach((meal) => {
        // Ici tu peux ajouter une checkbox dans le HTML pour chaque repas à inclure
        // Par défaut, on met true pour générer tous les repas
        mealsToPlan[day][meal] = true;
      });
    });

    const payload = {
      excludedIngredients: this.patientAllergies,
      mealsToPlan: this.mealsToPlan, // <-- maintenant c'est dynamique
    };

    // console.log('Payload auto:', payload);

    this.recipeService.generateAutoRecipes(payload).subscribe({
      next: (res: any) => {
        this.manualPlanning = res;
        console.log('Planning automatique généré:', this.manualPlanning);
        this.loadingRecipes = false;
        this.planningGenerated = true; // <-- planning prêt à afficher
      },
      error: (err) => {
        console.error(err);
        this.loadingRecipes = false;
      },
    });
  }

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

    if (mode === 'manuel') {
      // On ne touche pas à selectedRecipe → le token reste visible
      // Juste masquer la table auto
      this.planningGenerated = false;
    } else if (mode === 'auto') {
      // On pourrait vider le select si nécessaire
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

  // GENERATE PLANNING PDF
  savePlanning() {
    if (!this.dateDebut) {
      alert('Veuillez sélectionner une date de début pour le planning !');
      return;
    }

    const nbPeopleInput = (
      document.getElementById('nbPersonnes') as HTMLInputElement
    ).value;
    const nbPeople = parseInt(nbPeopleInput, 10) || 1;

    const payload = {
      startDate: this.dateDebut,
      nbPeople,
      planning: this.manualPlanning,
    };

    this.planningService
      .savePlanning(this.selectedPatientId, payload)
      .subscribe({
        next: () => alert('Planning enregistré ✅'),
        error: (err: any) => console.error(err),
      });
  }
}
