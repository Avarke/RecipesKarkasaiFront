export type IngredientFormRow = {
    ingredientId: number | null;
    ingredientName: string;
    quantity: string;
    unit: string;
    ingredientNameError?: string | null; // backend validation error
};

export const createEmptyIngredientRow = (): IngredientFormRow => ({
    ingredientId: null,
    ingredientName: "",
    quantity: "",
    unit: "",
    ingredientNameError: null,
});