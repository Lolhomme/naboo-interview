export interface City {
  nom: string;
  code: string;
  codeDepartement: string;
  departement?: {
    nom: string;
    code: string;
  };
  population?: number;
}