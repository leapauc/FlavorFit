import { Component, OnInit } from '@angular/core';
import {
  AppointmentsService,
  Appointment,
  AppointmentEdit,
} from '../../../services/appointments.services';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { startOfWeek, addDays, addWeeks } from 'date-fns';
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

  showDeleteConfirm = false;
  appointmentToDelete: Appointment | null = null;

  authUser: AuthUser | null = null;

  durations: number[] = [];
  availableSlots: string[] = [];

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
    this.generateDurations();
    this.loadPatients();
    this.loadAppointments();

    this.rdvForm.get('date')?.valueChanges.subscribe(() => {
      // reset heure sélectionnée
      this.rdvForm.patchValue({ time: '' }, { emitEvent: false });

      // recalcul avec la durée actuelle (60 par défaut)
      this.generateAvailableSlots();
    });

    this.rdvForm.get('duration')?.valueChanges.subscribe(() => {
      // reset heure si la durée change
      this.rdvForm.patchValue({ time: '' }, { emitEvent: false });

      this.generateAvailableSlots();
    });
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

  generateDurations() {
    for (let i = 15; i <= 240; i += 15) {
      this.durations.push(i);
    }
  }

  initWeek() {
    this.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    this.generateWeek();
  }

  generateWeek() {
    this.weekDays = [];

    for (let i = 0; i < 7; i++) {
      this.weekDays.push(addDays(this.currentWeekStart, i));
    }
  }

  nextWeek() {
    this.currentWeekStart = addWeeks(this.currentWeekStart, 1);
    this.generateWeek();
  }

  previousWeek() {
    this.currentWeekStart = addWeeks(this.currentWeekStart, -1);
    this.generateWeek();
  }

  loadAppointments() {
    this.appointmentService
      .getByPraticien(this.authUser!.id_praticien)
      .subscribe((data) => {
        this.appointments = data;

        this.generateAvailableSlots();
      });
  }

  loadPatients() {
    this.patientService
      .getAllPatientByPraticien(this.authUser!.id_praticien)
      .subscribe((data) => {
        this.patients = data;
      });
  }

  pad(n: number) {
    return n < 10 ? '0' + n : n;
  }

  generateAvailableSlots() {
    const date = this.rdvForm.get('date')?.value;
    const duration = Number(this.rdvForm.get('duration')?.value);

    if (!date) {
      this.availableSlots = [];
      return;
    }

    const slots: string[] = [];

    const dayAppointments = this.appointments.filter((rdv) => {
      const d = new Date(rdv.date_appointment);
      return d.toISOString().slice(0, 10) === date;
    });

    for (let hour = 8; hour < 18; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        const start = new Date(
          `${date}T${this.pad(hour)}:${this.pad(minute)}:00`,
        );
        const end = new Date(start.getTime() + duration * 60000);

        // stop si dépasse 18h
        if (
          end.getHours() > 18 ||
          (end.getHours() === 18 && end.getMinutes() > 0)
        ) {
          continue;
        }

        let conflict = false;

        for (const rdv of dayAppointments) {
          const rdvStart = new Date(rdv.date_appointment);
          const rdvEnd = new Date(rdvStart.getTime() + rdv.duration * 60000);

          if (start < rdvEnd && end > rdvStart) {
            conflict = true;
            break;
          }
        }

        if (!conflict) {
          slots.push(`${this.pad(hour)}:${this.pad(minute)}`);
        }
      }
    }

    this.availableSlots = slots;
  }

  isSlotFree(start: Date, end: Date): boolean {
    const sameDayAppointments = this.appointments.filter((rdv) => {
      const d = new Date(rdv.date_appointment);
      return d.toDateString() === start.toDateString();
    });

    for (const rdv of sameDayAppointments) {
      const rdvStart = new Date(rdv.date_appointment);
      const rdvEnd = new Date(rdvStart.getTime() + rdv.duration * 60000);

      const overlap = start < rdvEnd && end > rdvStart;

      if (overlap) return false;
    }

    return true;
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

  openModal(rdv?: Appointment) {
    this.showModal = true;

    if (rdv) {
      this.editingId = rdv.id_appointment!;
      this.rdvForm.patchValue(rdv);
    } else {
      this.editingId = null;
      this.rdvForm.reset({ duration: 60 });
    }

    // 🔥 recalcul des créneaux
    setTimeout(() => {
      this.generateAvailableSlots();
    });
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

    const dateValue = new Date(`${date}T${time}:00`);

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
