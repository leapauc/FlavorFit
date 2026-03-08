import { Routes } from '@angular/router';
import { TableComponent } from './pages/espace-praticien/table/table.component';
import { GestionPatientsComponent } from './pages/espace-praticien/gestion-patients/gestion-patients.component';
import { GestionRdvComponent } from './pages/espace-praticien/gestion-rdv/gestion-rdv.component';
import { GestionRecettesComponent } from './pages/espace-praticien/gestion-recettes/gestion-recettes.component';
import { HebmealgeneratorPatientComponent } from './pages/espace-praticien/espace-patient/hebmealgenerator/hebmealgenerator.component';
import { PlanningPasseComponent } from './pages/espace-praticien/espace-patient/planning-passe/planning-passe.component';
import { ContactComponent } from './pages/espace-praticien/espace-patient/contact/contact.component';
import { ContainteComponent } from './pages/espace-praticien/espace-patient/containte/containte.component';
import { EspacePraticienComponent } from './pages/espace-praticien/espace-praticien.component';
import { EspacePatientComponent } from './pages/espace-praticien/espace-patient/espace-patient.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { FruitLegumeComponent } from './pages/espace-praticien/info/fruit-legume/fruit-legume.component';
import { ViandePoissonOeufComponent } from './pages/espace-praticien/info/viande-poisson-oeuf/viande-poisson-oeuf.component';
import { HebmealgeneratorComponent } from './pages/espace-praticien/generator/hebmealgenerator.component';

export const routes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent },
  {
    path: 'praticien',
    component: EspacePraticienComponent,
    children: [
      { path: 'table', component: TableComponent },
      { path: 'hebmealgenerator', component: HebmealgeneratorComponent },
      { path: 'fruit_legume', component: FruitLegumeComponent },
      { path: 'viande_poisson_oeuf', component: ViandePoissonOeufComponent },
      {
        path: 'gestion_patients',
        component: GestionPatientsComponent,
        children: [
          { path: 'add/contact', component: ContactComponent },
          { path: 'add/constraint', component: ContainteComponent },
        ],
      },
      { path: 'gestion_rdv', component: GestionRdvComponent },
      {
        path: 'gestion_recettes',
        component: GestionRecettesComponent,
      },
    ],
  },
  {
    path: 'patient',
    component: EspacePatientComponent,
    children: [
      { path: 'contact', component: ContactComponent },
      { path: 'contrainte', component: ContainteComponent },
      {
        path: 'planning_passe',
        component: PlanningPasseComponent,
      },
      {
        path: 'generator',
        component: HebmealgeneratorPatientComponent,
      },
    ],
  },
];
