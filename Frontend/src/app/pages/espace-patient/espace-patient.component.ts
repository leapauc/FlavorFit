import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PatientService } from '../../services/patient.services';
import { PatientInfo } from '../../models/patientInfo';

@Component({
  selector: 'app-espace-patient',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './espace-patient.component.html',
  styleUrl: './espace-patient.component.css',
})
export class EspacePatientComponent implements OnInit {
  selectedPatient: PatientInfo | null = null;
  activeTab: string = 'Contact'; // Onglet actif par défaut

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.patientService.selectedPatient$.subscribe(
      (patient) => (this.selectedPatient = patient)
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab; // Met à jour l'onglet actif
  }
}
