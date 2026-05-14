import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentsService, Appointment } from '../../../services/appointments.services';
import { PatientService } from '../../../services/patient.services';
import { AuthService } from '../../../services/auth.services';
import { AuthUser } from '../../../models/authUser';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit {
  authUser: AuthUser | null = null;
  appointments: Appointment[] = [];
  nextAppointments: Appointment[] = [];
  patientsCount = 0;
  upcomingCount = 0;
  weekCount = 0;
  averageDuration = 0;
  isLoading = true;

  constructor(
    private appointmentService: AppointmentsService,
    private patientService: PatientService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authUser = this.authService.getUser();

    if (!this.authUser) {
      this.isLoading = false;
      return;
    }

    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.patientService
      .getAllPatientByPraticien(this.authUser!.id_praticien)
      .subscribe((patients) => {
        this.patientsCount = patients.length;
      });

    this.appointmentService
      .getByPraticien(this.authUser!.id_praticien)
      .subscribe((appointments) => {
        this.appointments = appointments.sort(
          (a, b) =>
            new Date(a.date_appointment).getTime() -
            new Date(b.date_appointment).getTime(),
        );

        this.buildMetrics();
        this.isLoading = false;
      });
  }

  private buildMetrics(): void {
    const now = new Date();
    const nextSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingAppointments = this.appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date_appointment);
      return appointmentDate >= now;
    });

    this.upcomingCount = upcomingAppointments.length;
    this.nextAppointments = upcomingAppointments.slice(0, 3);
    this.weekCount = upcomingAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date_appointment);
      return appointmentDate <= nextSevenDays;
    }).length;

    const totalDuration = upcomingAppointments.reduce(
      (sum, appointment) => sum + (appointment.duration || 0),
      0,
    );

    this.averageDuration = upcomingAppointments.length
      ? Math.round(totalDuration / upcomingAppointments.length)
      : 0;
  }

  get greeting(): string {
    return `Bonjour ${this.authUser?.firstname || 'Praticien'}`;
  }
}
