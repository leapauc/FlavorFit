import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../../services/patient.services';
import {
  PatientContact,
  PatientContactForm,
} from '../../../../models/patientContact';
import { ActivatedRoute } from '@angular/router';
import { GlobalNotificationComponent } from '../../../../components/global-notification/global-notification.component';
import { NotificationService } from '../../../../services/notification.services';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalNotificationComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  isEditMode = false;
  patientId: number | null = null;
  formData = {
    lastname: '',
    firstname: '',
    age: null as number | null,
    email: '',
    phone: '',
    rue: '',
    complement: '',
    code_postal: '',
    ville: '',
  };

  backupData = { ...this.formData };

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    const selectedPatient = this.patientService.getSelectedPatient();
    if (selectedPatient) {
      this.patientId = selectedPatient.id_patient;
      this.loadPatientContact(this.patientId);
    } else {
      console.error('Aucun patient sélectionné');
    }
  }

  loadPatientContact(idPatient: number) {
    this.patientService.getContactPatientById(idPatient).subscribe({
      next: (contact: PatientContact) => {
        this.formData.lastname = contact.lastname;
        this.formData.firstname = contact.firstname;
        this.formData.age = contact.age;
        this.formData.email = contact.email;
        this.formData.phone = contact.phone;

        // Adresse (tableau de 4 éléments : rue, complement, code postal, ville)
        this.formData.rue = contact.address[0] || '';
        this.formData.complement = contact.address[1] || '';
        this.formData.code_postal = contact.address[2] || '';
        this.formData.ville = contact.address[3] || '';

        // Sauvegarde pour pouvoir annuler
        this.backupData = { ...this.formData };
      },
      error: (err) => console.error(err),
    });
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) this.backupData = { ...this.formData };
  }

  cancelEdit() {
    this.formData = { ...this.backupData };
    this.isEditMode = false;
  }

  resetForm() {
    this.formData = { ...this.backupData };
  }

  saveEdit() {
    if (!this.patientId) return; // sécurité

    const contact: PatientContact = {
      id_patient: this.patientId,
      lastname: this.formData.lastname,
      firstname: this.formData.firstname,
      age: this.formData.age || 0,
      email: this.formData.email,
      phone: this.formData.phone,
      address: [
        this.formData.rue,
        this.formData.complement,
        this.formData.code_postal,
        this.formData.ville,
      ],
    };

    this.patientService
      .updatePatientContact(this.patientId, contact)
      .subscribe({
        next: (res) => {
          console.log('Contact mis à jour :', res);
          this.isEditMode = false;
          this.notificationService.show(
            'Modification bien prise en compte',
            'success',
          );
        },
        error: (err) => {
          console.error(err);
          this.notificationService.show(
            'Erreur lors de la modification',
            'error',
          );
        },
      });
  }
}