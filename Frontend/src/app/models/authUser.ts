/**
 * Représente un utilisateur authentifié dans l'application.
 *
 * Cette interface est utilisée notamment dans le service `AuthService`
 * pour stocker les informations de l'utilisateur connecté.
 */
export interface AuthUser {
  /**
   * Identifiant unique de l'utilisateur.
   */
  id_praticien: number;
  /**
   * Nom complet ou identifiant de l'utilisateur.
   */
  email: string;
  lastname: string;
  firstname: string;
}
