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
  patients: any[] = [];

  showModal = false;
  showDetailsModal = false;
  showDeleteConfirm = false;

  editingId: number | null = null;
  selectedAppointment: Appointment | null = null;
  appointmentToDelete: Appointment | null = null;

  rdvForm!: FormGroup;

  currentWeekStart!: Date;
  weekDays: Date[] = [];

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
    if (!this.authUser) return;

    this.initForm();
    this.initWeek();
    this.generateDurations();
    this.loadPatients();
    this.loadAppointments();

    this.rdvForm.get('date')?.valueChanges.subscribe(() => {
      this.rdvForm.patchValue({ time: '' }, { emitEvent: false });
      this.generateAvailableSlots();
    });

    this.rdvForm.get('duration')?.valueChanges.subscribe(() => {
      this.rdvForm.patchValue({ time: '' }, { emitEvent: false });
      this.generateAvailableSlots();
    });
  }

  // ---------------- FORM ----------------
  initForm() {
    this.rdvForm = this.fb.group({
      id_patient: [''],
      date: [''],
      time: [''],
      duration: [60],
      notes: [''],
    });
  }

  // ---------------- DURATIONS ----------------
  generateDurations() {
    this.durations = [];
    for (let i = 15; i <= 240; i += 15) this.durations.push(i);
  }

  // ---------------- WEEK ----------------
  initWeek() {
    this.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    this.generateWeek();
  }

  generateWeek() {
    this.weekDays = [];
    for (let i = 0; i < 6; i++) {
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

  // ---------------- DATA ----------------
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

  // ---------------- SLOTS ----------------
  pad(n: number) {
    return n < 10 ? '0' + n : n;
  }

  generateAvailableSlots() {
    const date = this.rdvForm.value.date;
    const duration = Number(this.rdvForm.value.duration);

    if (!date) {
      this.availableSlots = [];
      return;
    }

    const dayAppointments = this.appointments.filter((r) => {
      const rdvDate = new Date(r.date_appointment).toISOString().slice(0, 10);

      const isSameDay = rdvDate === date;

      // 🔥 EXCLURE le RDV en cours d'édition
      const isCurrentEdit = this.editingId === r.id_appointment;

      return isSameDay && !isCurrentEdit;
    });

    const slots: string[] = [];

    for (let h = 8; h < 18; h++) {
      for (let m of [0, 15, 30, 45]) {
        const start = new Date(`${date}T${this.pad(h)}:${this.pad(m)}:00`);
        const end = new Date(start.getTime() + duration * 60000);

        if (end.getHours() > 18) continue;

        const conflict = dayAppointments.some((rdv) => {
          const rs = new Date(rdv.date_appointment);
          const re = new Date(rs.getTime() + rdv.duration * 60000);
          return start < re && end > rs;
        });

        if (!conflict) slots.push(`${this.pad(h)}:${this.pad(m)}`);
      }
    }

    this.availableSlots = slots;
  }

  // ---------------- MODAL ----------------
  openModal(rdv?: Appointment) {
    this.showModal = true;
    this.editingId = rdv?.id_appointment ?? null;

    if (!rdv) {
      this.rdvForm.reset({ duration: 60 });
      this.generateAvailableSlots();
      return;
    }

    const d = new Date(rdv.date_appointment);

    // reconstruire en LOCAL propre
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);

    const time =
      (d.getUTCHours() + 2).toString().padStart(2, '0') +
      ':' +
      d.getUTCMinutes().toString().padStart(2, '0');

    const date = localDate.toISOString().split('T')[0];

    // 1. reset propre
    this.rdvForm.reset(
      {
        id_patient: rdv.id_patient,
        date: date,
        time: '',
        duration: rdv.duration,
        notes: rdv.notes,
      },
      { emitEvent: false },
    );

    // 2. générer slots AVANT sélection
    this.generateAvailableSlots();

    // 3. attendre Angular render select
    setTimeout(() => {
      this.rdvForm.patchValue({ time }, { emitEvent: false });
    });
  }

  closeModal() {
    this.showModal = false;
  }

  // ---------------- SAVE ----------------
  save() {
    const { date, time, id_patient, duration, notes } = this.rdvForm.value;

    if (!date || !time) return;

    const [hours, minutes] = time.split(':').map(Number);

    const dateAppointment = new Date(date);
    dateAppointment.setHours(hours, minutes, 0, 0);
    const isoString =
      dateAppointment.getFullYear() +
      '-' +
      String(dateAppointment.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(dateAppointment.getDate()).padStart(2, '0') +
      'T' +
      String(dateAppointment.getHours()).padStart(2, '0') +
      ':' +
      String(dateAppointment.getMinutes()).padStart(2, '0') +
      ':00';

    const payload: AppointmentEdit = {
      id_praticien: this.authUser!.id_praticien,
      id_patient: Number(id_patient),
      date_appointment: isoString,
      duration: Number(duration),
      notes: notes ?? null,
    };

    const request =
      this.editingId !== null
        ? this.appointmentService.update(this.editingId, payload)
        : this.appointmentService.create(payload);

    request.subscribe(() => {
      this.loadAppointments();
      this.notificationService.show(
        this.editingId ? 'RDV mis à jour' : 'RDV créé',
        'success',
      );
      this.closeModal();
    });
  }

  // ---------------- LIST ----------------
  getAppointmentsForDay(day: Date) {
    return this.appointments
      .filter(
        (r) =>
          new Date(r.date_appointment).toDateString() === day.toDateString(),
      )
      .sort(
        (a, b) =>
          new Date(a.date_appointment).getTime() -
          new Date(b.date_appointment).getTime(),
      );
  }

  getAppointmentTop(date: string) {
    const d = new Date(date);
    return ((d.getHours() - 8) * 60 + d.getMinutes()) * 2.2;
  }

  getAppointmentHeight(duration: number) {
    return Math.max(duration * 2.2 - 4, 90);
  }

  // ---------------- DELETE ----------------
  openDeleteModal(rdv: Appointment) {
    this.appointmentToDelete = rdv;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (!this.appointmentToDelete?.id_appointment) return;

    this.appointmentService
      .delete(this.appointmentToDelete.id_appointment)
      .subscribe(() => {
        this.loadAppointments();
        this.showDeleteConfirm = false;
        this.appointmentToDelete = null;
        this.notificationService.show('RDV supprimé avec succès !', 'success');
        this.cancelDelete();
      });
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.appointmentToDelete = null;
  }

  // ---------------- DETAILS ----------------
  openDetailsModal(rdv: Appointment) {
    this.selectedAppointment = rdv;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedAppointment = null;
  }

  // ---------------- ACTIONS DETAILS ----------------
  editFromDetails(rdv: Appointment) {
    this.closeDetailsModal();
    setTimeout(() => this.openModal(rdv));
  }

  deleteFromDetails(rdv: Appointment) {
    this.closeDetailsModal();
    setTimeout(() => this.openDeleteModal(rdv));
  }
}
