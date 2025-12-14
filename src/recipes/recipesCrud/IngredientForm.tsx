// src/recipes/IngredientForm.ts

export type IngredientFormRow = {
    ingredientId: number | null;
    ingredientName: string;
    quantity: string;
    unit: string;
    ingredientNameError?: string | null;
};

const normalizeIngredientName = (name: string) =>
    name.trim().toLowerCase();

/**
 * Returns true if there are duplicates (ignoring case/whitespace)
 */
export const hasDuplicateIngredientNames = (
    ingredients: IngredientFormRow[]
): boolean => {
    const seen = new Set<string>();
    const dup = new Set<string>();

    ingredients.forEach((ing) => {
        const norm = normalizeIngredientName(ing.ingredientName);
        if (!norm) return;
        if (seen.has(norm)) {
            dup.add(norm);
        } else {
            seen.add(norm);
        }
    });

    return dup.size > 0;
};

/**
 * Writes error messages into ingredientNameError for duplicates.
 * Clears previous ingredientNameError first.
 */
export const applyDuplicateIngredientErrors = (
    ingredients: IngredientFormRow[]
) => {
    // clear previous
    ingredients.forEach((ing) => {
        ing.ingredientNameError = null;
    });

    const map = new Map<string, IngredientFormRow[]>();

    ingredients.forEach((ing) => {
        const norm = normalizeIngredientName(ing.ingredientName);
        if (!norm) return;

        const arr = map.get(norm) ?? [];
        arr.push(ing);
        map.set(norm, arr);
    });

    map.forEach((rows) => {
        if (rows.length > 1) {
            rows.forEach((ing) => {
                ing.ingredientNameError =
                    "This ingredient is already added to the recipe.";
            });
        }
    });
};
