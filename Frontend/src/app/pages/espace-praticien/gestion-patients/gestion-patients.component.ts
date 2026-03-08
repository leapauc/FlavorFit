import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  PatientCreate,
  PatientForm,
  PatientInfo,
} from '../../../models/patientInfo';
import { PatientService } from '../../../services/patient.services';
import { AuthService } from '../../../services/auth.services';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormsModule } from '@angular/forms';

// import { ContainteComponent } from '../../espace-patient/containte/containte.component';
import { ContactComponent } from '../espace-patient/contact/contact.component';
import {
  PathologyGroup,
  PathologyGroupUi,
} from '../../../models/pathologyGroup';
import { GetInfoFromDBService } from '../../../services/getInfoFromDB';
import { Conviction } from '../../../models/infoDB';
import { NotificationService } from '../../../services/notification.services';
import { GlobalNotificationComponent } from '../../../components/global-notification/global-notification.component';

@Component({
  selector: 'app-gestion-patients',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, GlobalNotificationComponent],
  templateUrl: './gestion-patients.component.html',
  styleUrls: ['./gestion-patients.component.css'],
})
export class GestionPatientsComponent implements OnInit {
  patient: PatientInfo[] = [];
  filteredPatients: PatientInfo[] = [];
  isLoading = true;

  isEditMode = true;

  pathologyGroups: PathologyGroupUi[] = [];
  convictionGroups: string[] = [];

  formData = {
    id_patient: 0, // obligatoire pour éviter NG1
    lastname: '',
    firstname: '',
    age: null as number | null,
    email: '',
    phone: '',
    rue: '',
    complement: '',
    code_postal: '',
    ville: '',
    pathologies: '',
    allergies: '',
    conviction: '',
    other: '',
    history: '',
  };

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router,
    private getInfoFromDB: GetInfoFromDBService,
    private notificationService: NotificationService,
  ) {}

  // Recherche
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;

  ngOnInit() {
    this.loadPatient();
    this.loadPathologies();
    this.loadConviction();
  }

  loadPatient() {
    this.isLoading = true;
    const praticien = this.authService.getUser();
    if (!praticien) return;

    this.patientService
      .getAllPatientByPraticien(praticien.id_praticien)
      .subscribe({
        next: (data) => {
          this.patient = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
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

  loadConviction() {
    this.getInfoFromDB.getConvictions().subscribe({
      next: (data: Conviction[]) => {
        this.convictionGroups = data.map((c) => c.name);
      },
      error: (err) => console.error(err),
    });
  }

  get filteredPatientsList(): PatientInfo[] {
    if (!this.searchTerm) {
      return this.patient;
    }

    const term = this.searchTerm.toLowerCase();

    return this.patient.filter(
      (p) =>
        p.lastname.toLowerCase().includes(term) ||
        p.firstname.toLowerCase().includes(term),
    );
  }
  get paginatedPatients(): PatientInfo[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPatientsList.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    );
  }
  get totalPages(): number {
    return Math.ceil(this.filteredPatientsList.length / this.itemsPerPage);
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
  selectPatient(patient: PatientInfo) {
    this.patientService.setSelectedPatient(patient);
    this.router.navigate(['/patient/contact']);
  }

  // DELETE PATIENT
  showDeleteModal = false;
  patientToDelete: PatientInfo | null = null;

  // Ouvre le modal avec le patient à supprimer
  confirmDeletePatient(patient: PatientInfo) {
    this.patientToDelete = patient;
    this.showDeleteModal = true;
  }

  // Ferme le modal sans supprimer
  cancelDelete() {
    this.patientToDelete = null;
    this.showDeleteModal = false;
  }

  // Supprime réellement le patient
  deletePatient() {
    if (!this.patientToDelete) return;

    this.patientService
      .deletePatient(this.patientToDelete.id_patient)
      .subscribe({
        next: () => {
          this.patient = this.patient.filter(
            (p) => p.id_patient !== this.patientToDelete!.id_patient,
          );

          this.notificationService.show(
            'Patient supprimé avec succès',
            'success',
          );

          this.cancelDelete();
        },
        error: () => {
          this.notificationService.show(
            'Erreur lors de la suppression du patient',
            'error',
          );
          this.cancelDelete();
        },
      });
  }

  // MODAL
  activeTab: 'Contact' | 'Contrainte' = 'Contact';
  showModal = false;
  newPatient: Partial<PatientForm> = {};

  openModal() {
    this.showModal = true;
    this.newPatient = { ...this.newPatient }; // reset des champs à leur valeur par défaut
  }

  closeModal() {
    this.showModal = false;
  }

  setActiveTab(tab: 'Contact' | 'Contrainte') {
    this.activeTab = tab;
  }

  createPatient() {
    const praticien = this.authService.getUser();
    if (!praticien) return;

    const patientToCreate: PatientCreate = {
      id_praticien: praticien.id_praticien,
      lastname: this.formData.lastname || '',
      firstname: this.formData.firstname || '',
      age: this.formData.age || 0,
      email: this.formData.email || '',
      phone: this.formData.phone || '',
      address: [
        this.formData.rue || '',
        this.formData.complement || '',
        this.formData.code_postal || '',
        this.formData.ville || '',
      ],
      pathologies: this.selectedPathologies, // ton tableau de pathologies sélectionnées
      conviction: this.formData.conviction || null,
      allergies: this.formData.allergies
        ? this.formData.allergies.split('\n')
        : null,
      history: this.formData.history || null,
      other: this.formData.other || null,
    };

    this.patientService.createPatient(patientToCreate).subscribe({
      next: (created) => {
        this.patient.push(created);

        this.notificationService.show('Patient créé avec succès', 'success');

        this.closeModal();
      },
      error: () => {
        this.notificationService.show(
          'Erreur lors de la création du patient',
          'error',
        );
      },
    });
  }

  selectedPathologies: string[] = [];
  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  togglePathology(pathology: string) {
    const index = this.selectedPathologies.indexOf(pathology);
    if (index > -1) {
      this.selectedPathologies.splice(index, 1);
    } else {
      this.selectedPathologies.push(pathology);
    }
  }

  removePathology(pathology: string) {
    this.selectedPathologies = this.selectedPathologies.filter(
      (p) => p !== pathology,
    );
  }
}
