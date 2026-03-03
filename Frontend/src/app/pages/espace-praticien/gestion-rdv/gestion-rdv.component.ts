import { Component, OnInit } from '@angular/core';
import {
  AppointmentsService,
  Appointment,
  AppointmentEdit,
} from '../../../services/appointments.services';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { startOfWeek, addDays, addWeeks, format } from 'date-fns';
import { PatientService } from '../../../services/patient.services';
import { GlobalNotificationComponent } from '../../../components/global-notification/global-notification.component';
import { NotificationService } from '../../../services/notification.services';
import { AuthService } from '../../../services/auth.services';
import { AuthUser } from '../../../models/authUser';

@Component({
  selector: 'app-gestion-rdv',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GlobalNotificationComponent],
  templateUrl: './gestion-rdv.component.html',
  styleUrl: './gestion-rdv.component.css',
})
export class GestionRdvComponent implements OnInit {
  appointments: Appointment[] = [];
  showModal = false;
  editingId: number | null = null;

  rdvForm!: FormGroup;
  currentWeekStart!: Date;
  weekDays: Date[] = [];

  patients: any[] = [];
  availableSlots: string[] = [];

  showDeleteConfirm = false;
  appointmentToDelete: Appointment | null = null;

  authUser: AuthUser | null = null;

  timeSlots: string[] = [];

  constructor(
    private appointmentService: AppointmentsService,
    private patientService: PatientService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authUser = this.authService.getUser();

    if (!this.authUser) {
      console.error('Utilisateur non connecté');
      return;
    }
    this.initForm();
    this.initWeek();
    this.loadPatients();
    this.loadAppointments();
    this.generateTimeSlots();
  }
  initWeek() {
    this.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // lundi
    this.generateWeek();
  }

  generateWeek() {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      this.weekDays.push(addDays(this.currentWeekStart, i));
    }
  }
  generateTimeSlots() {
    const slots: string[] = [];

    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${this.pad(hour)}:00`);
      slots.push(`${this.pad(hour)}:15`);
      slots.push(`${this.pad(hour)}:30`);
      slots.push(`${this.pad(hour)}:45`);
    }

    this.timeSlots = slots;
  }

  pad(n: number) {
    return n < 10 ? '0' + n : n;
  }

  nextWeek() {
    this.currentWeekStart = addWeeks(this.currentWeekStart, 1);
    this.generateWeek();
  }

  previousWeek() {
    this.currentWeekStart = addWeeks(this.currentWeekStart, -1);
    this.generateWeek();
  }

  getAppointmentsForDay(day: Date) {
    return this.appointments
      .filter((rdv) => {
        const rdvDate = new Date(rdv.date_appointment);
        return rdvDate.toDateString() === day.toDateString();
      })
      .sort(
        (a, b) =>
          new Date(a.date_appointment).getTime() -
          new Date(b.date_appointment).getTime(),
      );
  }

  isSlotAvailable(date: string): boolean {
    return !this.appointments.some(
      (rdv) =>
        new Date(rdv.date_appointment).getTime() === new Date(date).getTime(),
    );
  }
  initForm() {
    this.rdvForm = this.fb.group({
      id_patient: [''],
      date: [''],
      time: [''],
      duration: [60],
      notes: [''],
    });
  }

  loadAppointments() {
    this.appointmentService
      .getByPraticien(this.authUser!.id_praticien)
      .subscribe((data) => (this.appointments = data));
  }

  loadPatients() {
    this.patientService
      .getAllPatientByPraticien(this.authUser!.id_praticien)
      .subscribe((data) => {
        this.patients = data;
      });
  }

  openModal(rdv?: Appointment) {
    this.showModal = true;

    if (rdv) {
      this.editingId = rdv.id_appointment!;
      this.rdvForm.patchValue(rdv);
    } else {
      this.editingId = null;
      this.rdvForm.reset({ duration: 60 });
    }
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    const date = this.rdvForm.value.date;
    const time = this.rdvForm.value.time;

    if (!date || !time) {
      this.notificationService.show(
        'Veuillez sélectionner une date et une heure',
        'error',
      );
      return;
    }

    // 🔥 Construction correcte de la date
    const dateValue = new Date(`${date}T${time}:00`);

    const hours = dateValue.getHours();
    const minutes = dateValue.getMinutes();

    // Vérification horaires
    if (hours < 8 || hours >= 18) {
      this.notificationService.show(
        'Les RDV doivent être entre 8h et 18h',
        'error',
      );
      return;
    }

    // Vérification 15 minutes
    if (minutes % 15 !== 0) {
      this.notificationService.show(
        'Les RDV doivent être par tranche de 15 minutes',
        'error',
      );
      return;
    }

    const formValue: AppointmentEdit = {
      id_praticien: Number(this.authUser!.id_praticien),
      id_patient: Number(this.rdvForm.value.id_patient),
      date_appointment: dateValue.toLocaleString('sv-SE').replace(' ', 'T'),
      duration: Number(this.rdvForm.value.duration),
      notes: this.rdvForm.value.notes ?? null,
    };

    if (this.editingId) {
      this.appointmentService
        .update(this.editingId, formValue)
        .subscribe(() => {
          this.loadAppointments();
          this.notificationService.show(
            'RDV mis à jour avec succès !',
            'success',
          );
          this.closeModal();
        });
    } else {
      this.appointmentService.create(formValue).subscribe(() => {
        this.loadAppointments();
        this.notificationService.show('RDV créé avec succès !', 'success');
        this.closeModal();
      });
    }
  }

  openDeleteModal(rdv: Appointment) {
    this.appointmentToDelete = rdv;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.appointmentToDelete = null;
  }

  confirmDelete() {
    if (!this.appointmentToDelete) return;

    this.appointmentService
      .delete(this.appointmentToDelete.id_appointment!)
      .subscribe(() => {
        this.loadAppointments();

        this.notificationService.show('RDV supprimé avec succès !', 'success');
        this.cancelDelete();
      });
  }
}
