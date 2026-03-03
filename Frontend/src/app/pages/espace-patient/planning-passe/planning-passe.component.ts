import { Component, OnInit } from '@angular/core';
import { PlanningService } from '../../../services/planning.services';
import { PatientService } from '../../../services/patient.services';
import { CommonModule } from '@angular/common';

interface Planning {
  id_planning: number;
  start_day: string;
  end_day?: string;
  notes?: string;
}

interface PlanningDetails {
  id_planning: number;
  id_patient: number;
  start_day: string;
  nb_people: number;
  details: {
    [day: string]: {
      [meal: string]: {
        id: number;
        title: string;
      } | null;
    };
  };
}

@Component({
  selector: 'app-planning-passe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning-passe.component.html',
  styleUrls: ['./planning-passe.component.css'],
})
export class PlanningPasseComponent implements OnInit {
  plannings: Planning[] = [];
  selectedPatientId!: number;
  loading = false;

  selectedPlanningDetails: PlanningDetails | null = null;
  showModal = false;

  days: string[] = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  meals: string[] = ['Midi', 'Dîner'];

  constructor(
    private planningService: PlanningService,
    private patientService: PatientService,
  ) {}

  ngOnInit(): void {
    const patient = this.patientService.getSelectedPatient();

    if (!patient) {
      console.error('Aucun patient sélectionné');
      return;
    }

    this.selectedPatientId = patient.id_patient;
    this.loadPlannings();
  }

  loadPlannings(): void {
    this.loading = true;

    this.planningService
      .getPlanningByPatient(this.selectedPatientId)
      .subscribe({
        next: (res: Planning[]) => {
          this.plannings = res
            .sort(
              (a, b) =>
                new Date(b.start_day).getTime() -
                new Date(a.start_day).getTime(),
            )
            .slice(0, 20);

          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement plannings :', err);
          this.loading = false;
        },
      });
  }

  openPlanningModal(idPlanning: number): void {
    this.planningService.getPlanningDetails(idPlanning).subscribe({
      next: (res: PlanningDetails) => {
        this.selectedPlanningDetails = res;
        this.showModal = true;
      },
      error: (err) => {
        console.error('❌ Erreur détails planning :', err);
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPlanningDetails = null;
  }
}
