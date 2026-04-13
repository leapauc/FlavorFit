import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientConstraint } from '../../../../models/patientConstraint';
import { PatientService } from '../../../../services/patient.services';
import { ActivatedRoute } from '@angular/router';
import { GetInfoFromDBService } from '../../../../services/getInfoFromDB';
import {
  PathologyGroup,
  PathologyGroupUi,
} from '../../../../models/pathologyGroup';
import { Conviction, Restriction } from '../../../../models/infoDB';
import { IngredientService } from '../../../../services/ingredient.services';
import { GlobalNotificationComponent } from '../../../../components/global-notification/global-notification.component';
import { NotificationService } from '../../../../services/notification.services';

@Component({
  selector: 'app-containte',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalNotificationComponent],
  templateUrl: './containte.component.html',
  styleUrl: './containte.component.css',
})
export class ContainteComponent {
  isEditMode = false; // mode lecture / édition
  patientId: number | null = null;

  // copie du formulaire pour reset
  formData = {
    pathologies: '',
    allergies: '',
    conviction: '',
    autres_info: '',
    antecedents: '',
  };

  pathologyGroups: PathologyGroupUi[] = [];
  convictionGroups: string[] = [];

  // on stocke les pathologies sélectionnées sous forme de tableau
  selectedPathologies: string[] = [];

  dropdownOpen = false;

  backupData = { ...this.formData };
  backupSelectedPathologies: string[] = [];

  allIngredients: string[] = [];
  filteredIngredients: string[] = [];
  ingredientSearch: string = '';
  selectedAllergies: string[] = [];

  Restrictions: string[] = [];
  selectedRestrictions: string[] = [];
  restrictionsDropdownOpen = false;

  isSaving = false;

  constructor(
    private patientService: PatientService,
    private getIngredient: IngredientService,
    private getInfoFromDB: GetInfoFromDBService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Ferme les dropdowns si on clique en dehors
    if (!target.closest('.pathology-dropdown') && this.dropdownOpen) {
      this.dropdownOpen = false;
    }
    if (
      !target.closest('.restrictions-dropdown') &&
      this.restrictionsDropdownOpen
    ) {
      this.restrictionsDropdownOpen = false;
    }
    if (
      !target.closest('.allergies-autocomplete') &&
      this.filteredIngredients.length
    ) {
      this.filteredIngredients = [];
    }
  }

  ngOnInit() {
    const selectedPatient = this.patientService.getSelectedPatient();
    if (selectedPatient) {
      this.patientId = selectedPatient.id_patient;
      this.loadPathologies();
      this.loadConviction();
      this.loadPatientConstraint(this.patientId);
    }
    this.loadIngredients();
    this.loadRestrictions();
  }

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

  loadPatientConstraint(idPatient: number) {
    this.getInfoFromDB.getPathologiesByType().subscribe();

    this.patientService.getConstraintPatientById(idPatient).subscribe({
      next: (constraint: PatientConstraint) => {
        this.selectedPathologies = constraint.pathologies || [];

        this.selectedAllergies = constraint.allergies || [];
        this.formData.allergies = this.selectedAllergies.join(', ');
        this.formData.conviction = constraint.conviction || '';
        this.formData.autres_info = constraint.other || '';
        this.formData.antecedents = constraint.history || '';

        this.backupData = {
          ...this.formData,
          pathologies: this.selectedPathologies.join(', '),
        };
      },
      error: (err) => console.error(err),
    });
  }

  loadIngredients() {
    this.getIngredient.getDistinctIngredient().subscribe({
      next: (data: any[]) => {
        this.allIngredients = data.map((i) => i.alim_nom_fr).filter(Boolean);

        this.allIngredients = Array.from(new Set(this.allIngredients)).sort();
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
      .filter(
        (i) =>
          i.toLowerCase().includes(term) && !this.selectedAllergies.includes(i),
      )
      .slice(0, 20);
  }

  toggleAllergy(item: string) {
    if (!this.selectedAllergies.includes(item)) {
      this.selectedAllergies.push(item);
    }

    this.ingredientSearch = '';
    this.filteredIngredients = [];
    this.syncAllergiesToForm();
  }

  removeAllergy(item: string) {
    this.selectedAllergies = this.selectedAllergies.filter((a) => a !== item);

    this.syncAllergiesToForm();
  }

  private syncAllergiesToForm() {
    this.formData.allergies = this.selectedAllergies.join(', ');
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  togglePathology(item: string) {
    if (this.selectedPathologies.includes(item)) {
      this.selectedPathologies = this.selectedPathologies.filter(
        (p) => p !== item,
      );
    } else {
      this.selectedPathologies = [...this.selectedPathologies, item];
    }
  }

  closePathologyDropdown() {
    this.dropdownOpen = false;
  }

  removePathology(item: string) {
    this.selectedPathologies = this.selectedPathologies.filter(
      (p) => p !== item,
    );
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      // Sauvegarde l'état courant au moment où on passe en édition
      this.backupData = { ...this.formData };
      this.backupSelectedPathologies = [...this.selectedPathologies];
    }
  }

  toggleRestrictionsDropdown(): void {
    this.restrictionsDropdownOpen = !this.restrictionsDropdownOpen;
  }

  toggleRestrictionsOption(option: string): void {
    if (this.selectedRestrictions.includes(option)) {
      this.selectedRestrictions = this.selectedRestrictions.filter(
        (o) => o !== option,
      );
    } else {
      this.selectedRestrictions.push(option);
    }
  }

  closeRestrictionsDropdown(): void {
    this.restrictionsDropdownOpen = false;
  }

  removeRestrictionsOption(option: string): void {
    this.selectedRestrictions = this.selectedRestrictions.filter(
      (o) => o !== option,
    );
  }

  // ------------------ Utilitaires ------------------
  sanitizeId(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
  }

  trackByString(index: number, item: string): string {
    return item;
  }

  trackByPathologyGroup(index: number, item: PathologyGroupUi): string {
    return item.type;
  }

  resetForm() {
    // Remet l'état tel qu'il était au début de l'édition
    this.formData = { ...this.backupData };
    this.selectedPathologies = [...this.backupSelectedPathologies];
  }

  cancelEdit() {
    // Même comportement que reset, puis quitte le mode édition
    this.formData = { ...this.backupData };
    this.selectedPathologies = [...this.backupSelectedPathologies];
    this.isEditMode = false;
  }

  saveEdit() {
    if (!this.patientId) return;

    this.isSaving = true;
    const constraint: PatientConstraint = {
      id_patient: this.patientId,
      pathologies: this.selectedPathologies,
      allergies: this.selectedAllergies,
      history: this.formData.antecedents || '',
      other: this.formData.autres_info || '',
      conviction: this.formData.conviction || '',
    };

    this.patientService
      .updatePatientConstraint(this.patientId, constraint)
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.notificationService.show(
            'Contraintes sauvegardées avec succès',
            'success',
          );
          this.isEditMode = false;
        },
        error: (err) => {
          this.isSaving = false;
          this.notificationService.show(
            'Erreur lors de la sauvegarde',
            'error',
          );
          console.error(err);
        },
      });
  }
}
