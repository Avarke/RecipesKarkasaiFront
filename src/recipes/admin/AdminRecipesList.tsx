import { useNavigate } from "react-router-dom";
import AdminTabs from "../../admin/adminTabs";

import { useRecipeList } from "../hooks/useRecipeList";
import RecipeDeleteDialog from "../components/RecipeDeleteDialog";
import RecipeTable from "../components/RecipeTable";

function AdminRecipesList() {
    const navigate = useNavigate();

    // Admin gets all recipes
    const {
        recipes,
        loading,
        error,
        isDeleting,
        recipeToDelete,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
    } = useRecipeList("/recipes");

    if (loading) return <p className="text-center mt-5">Loading recipes...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;

    return (
        <div className="container mt-4">
            {/* Top header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Admin Dashboard</h2>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => navigate("/recipes")}
                    >
                        Back to public recipes
                    </button>

                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => navigate("./create")}
                    >
                        + New Recipes
                    </button>
                </div>
            </div>

            {/* Admin tabs */}
            <AdminTabs />

            {/* Shared delete dialog */}
            <RecipeDeleteDialog
                visible={isDeleting}
                recipe={recipeToDelete}
                onHide={closeDeleteDialog}
                onConfirm={confirmDelete}
            />

            {/* Shared table */}
            <RecipeTable
                recipes={recipes}
                onDelete={openDeleteDialog}
                editPath={(id) => `./edit/${id}`}
            />
        </div>
    );
}

export default AdminRecipesList;