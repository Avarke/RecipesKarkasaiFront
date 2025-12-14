import { useEffect, useState } from "react";
import backend from "../../app/backend";
import config from "../../app/config";
import { notifyFailure, notifySuccess } from "../../app/notify";
import { RecipeListVm } from "../models/RecipeListVm";

export function useRecipeList(getPath: string) {
    const [recipes, setRecipes] = useState<RecipeListVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState<RecipeListVm | null>(null);

    useEffect(() => {
        setLoading(true);
        backend
            .get(config.backendUrl + getPath)
            .then((r) => setRecipes(r.data as RecipeListVm[]))
            .catch((err) => {
                console.error("Failed to load recipes:", err);
                setError("Could not load recipes. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, [getPath]);

    const openDeleteDialog = (recipe: RecipeListVm) => {
        setRecipeToDelete(recipe);
        setIsDeleting(true);
    };

    const closeDeleteDialog = () => setIsDeleting(false);

    const confirmDelete = async () => {
        if (!recipeToDelete) return;
        setIsDeleting(false);

        try {
            await backend.delete(config.backendUrl + `/recipes/${recipeToDelete.id}`);
            setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id));
            notifySuccess("Recipe deleted.");
        } catch (err) {
            console.error("Failed to delete recipe:", err);
            notifyFailure(
                `Deletion of recipe '${recipeToDelete.id}' has failed. Either this recipe cannot be deleted or there was a backend failure.`
            );
        } finally {
            setRecipeToDelete(null);
        }
    };

    return {
        recipes, loading, error,
        isDeleting, recipeToDelete,
        openDeleteDialog, closeDeleteDialog, confirmDelete
    };
}