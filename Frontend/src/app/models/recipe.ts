export interface Category {
  categorie: string;
}

export interface Difficulty {
  difficulty: string;
}

export interface Price {
  price: string;
}

export interface Ecoscore {
  ecoscore: string;
}

export interface IngredientPayload {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipePayload {
  id_recipe?: number;
  id_praticien: number;
  title: string;
  categorie: string;
  servings: number;
  prepTime: number;
  difficulty: string;
  price: string;
  ecoscore: string;
  url?: string;
  description?: string[]; // correspond à ta colonne TEXT[]
  ingredients: IngredientPayload[];

  kcal?: number;
  kj?: number;
  proteine?: number;
  lipide?: number;
  glucide?: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
  ag?: number;
  cholesterol?: number;
}
