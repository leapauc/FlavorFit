import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { RecipeService } from '../../../../services/recipe.services';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PatientService } from '../../../../services/patient.services';
import { PlanningService } from '../../../../services/planning.services';
import { MailService } from '../../../../services/mails.services';
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

  dietaryDropdownOpen = false;

  days = ['Jour1', 'Jour2', 'Jour3', 'Jour4', 'Jour5', 'Jour6', 'Jour7'];
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
  selectedPatientEmail!: string;
  selectedPatientLastname!: string;
  selectedPatientFirstname!: string;
  selectedPatientPathologies: string[] | null = null;
  selectedPatientConvictions: string[] | null = null;
  selectedPatientRestrictions: string[] = [];

  shoppingList: any = {};
  showShoppingList = false;
  shoppingListMode: 'auto' | 'manuel' | null = null;

  showPlanningModal = false;
  planningModalTitle = '';
  planningModalMessage = '';
  planningModalType: 'success' | 'error' = 'success';

  constructor(
    private recipeService: RecipeService,
    private patientService: PatientService,
    private planningService: PlanningService,
    private mailService: MailService,
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
      this.selectedPatientEmail = patient.email;
      this.selectedPatientLastname = patient.lastname;
      this.selectedPatientFirstname = patient.firstname;
      this.selectedPatientPathologies = patient.pathologies ?? [];
      this.selectedPatientConvictions = patient.convictions ?? [];
      this.loadPatientAllergies(this.selectedPatientId);
      this.loadPatientConstraints(this.selectedPatientId);
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

  loadPatientConstraints(id_patient: number) {
    this.patientService.getConstraintPatientById(id_patient).subscribe({
      next: (constraint) => {
        this.selectedPatientConvictions = constraint.convictions || [];
        this.selectedPatientRestrictions = constraint.restrictions || [];
        this.selectedPatientPathologies = constraint.pathologies || [];

        this.validateFilters();
      },
      error: (err) => console.error(err),
    });
  }

  validateFilters() {
    this.loadingRecipes = true;

    const excludedIngredients = [...this.patientAllergies];
    const convictions = this.selectedPatientConvictions ?? [];
    const restrictions = this.selectedPatientRestrictions ?? [];

    this.recipeService
      .getFilteredRecipes({
        excludedIngredients,
        convictions,
        restrictions,
      })
      .subscribe({
        next: (recipes: any[]) => {
          this.filteredRecipes = recipes.map((r) => ({
            id: r.id_recipe,
            title: r.title,
            ingredients: r.ingredients || [],
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
      mealsToPlan: this.mealsToPlan,
      convictions: this.selectedPatientConvictions ?? [],
      restrictions: this.selectedPatientRestrictions ?? [],
    };

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

  /* ===============================
     GÉNÉRATION LISTE DE COURSE
  =============================== */
  private getRecipeIdsFromPlanning(): number[] {
    const ids: number[] = [];

    Object.values(this.manualPlanning).forEach((day: any) => {
      Object.values(day).forEach((meal: any) => {
        if (meal?.id) {
          ids.push(meal.id);
        }
      });
    });

    return [...new Set(ids)];
  }

  openModal(title: string, message: string, type: 'success' | 'error' = 'success') {
    this.planningModalTitle = title;
    this.planningModalMessage = message;
    this.planningModalType = type;
    this.showPlanningModal = true;
  }

  closeModal() {
    this.showPlanningModal = false;
  }

  generateShoppingList() {
    const recipeIds = this.getRecipeIdsFromPlanning();

    if (!recipeIds.length) {
      this.openModal(
        'Aucune recette sélectionnée',
        'Veuillez sélectionner au moins une recette dans votre planning avant de générer la liste de course.',
        'error',
      );
      return null;
    }

    const request$ = this.planningService.generateShoppingList(recipeIds);

    request$.subscribe({
      next: (data) => {
        this.shoppingList = data;
        this.showShoppingList = true;
        this.shoppingListMode = this.mode;
      },
      error: (err) => {
        console.error('ERREUR:', err);
        this.openModal(
          'Erreur de génération',
          'Impossible de générer la liste de course. Vérifiez votre connexion et réessayez.',
          'error',
        );
      },
    });

    return request$;
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

  // GENERATE PLANNING PDF
  savePlanning() {
    if (!this.dateDebut) {
      this.openModal(
        'Date manquante',
        'Veuillez sélectionner une date de début pour le planning avant de valider.',
        'error',
      );
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

    const sendData = () => {
      this.planningService
        .savePlanning(this.selectedPatientId, payload)
        .subscribe({
          next: () => {
            this.openModal(
              'Planning enregistré ✅',
              `Le planning a bien été sauvegardé et un e-mail de confirmation a été envoyé à ${this.selectedPatientFirstname} ${this.selectedPatientLastname}.`,
              'success',
            );
          },
          error: (err: any) => {
            console.error(err);
            this.openModal(
              'Erreur d’enregistrement',
              'Le planning n’a pas pu être sauvegardé. Veuillez réessayer.',
              'error',
            );
          },
        });

      const emailPayload = {
        email: this.selectedPatientEmail,
        firstName: this.selectedPatientFirstname,
        lastName: this.selectedPatientLastname,
        startDate: this.dateDebut,
        payload: {
          constraints: {
            nbPersons: nbPeople,
            startDate: this.dateDebut,
            pathologies: this.selectedPatientPathologies,
            convictions: this.selectedPatientConvictions,
            restrictions: this.selectedPatientRestrictions,
            ingredientsExcluded: this.patientAllergies,
          },
          planning: this.manualPlanning,
          shoppingList: this.shoppingList,
        },
      };

      this.mailService.sendPlanningEmail(emailPayload).subscribe();
    };

    // Si la shopping list existe déjà
    if (this.shoppingList && Object.keys(this.shoppingList).length) {
      sendData();
    }
    // Sinon on la génère avant
    else {
      this.generateShoppingList()?.subscribe({
        next: (data) => {
          this.shoppingList = data;
          sendData();
        },
        error: (err) => console.error(err),
      });
    }
  }
}
