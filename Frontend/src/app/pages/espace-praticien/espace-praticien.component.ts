import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthUser } from '../../models/authUser';
import { AuthService } from '../../services/auth.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-espace-praticien',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './espace-praticien.component.html',
  styleUrl: './espace-praticien.component.css',
})
export class EspacePraticienComponent implements OnInit {
  /**
   * Détermine si la section QCM est affichée.
   */
  showQcm = false;
  /**
   * Détermine si la section Questions est affichée.
   */
  showQuestions = false;
  /**
   * Détermine si la section Utilisateurs est affichée.
   */
  showUtilisateur = false;
  /**
   * Détermine si la section Options est affichée.
   */
  showOption = false;
  /** état pour le menu responsive */
  isSidebarOpen = false;

  authUser: AuthUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authUser = this.authService.getUser();
  }

  /**
   * Basculer l'affichage de la section QCM.
   */
  toggleQcm() {
    this.showQcm = !this.showQcm;
  }

  /**
   * Afficher/Désafficher la barre de navigation latérale.
   */
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  /**
   * Réduit la barre de navigation latérale quand la fenêtre est de petite taille.
   */
  closeSidebar() {
    if (window.innerWidth <= 890) {
      this.isSidebarOpen = false;
    }
  }
}
