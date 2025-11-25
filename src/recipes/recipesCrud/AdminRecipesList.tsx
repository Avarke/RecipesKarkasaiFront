// src/recipes/RecipeCrud/AdminRecipesList.tsx (path may differ in your project)

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Dialog } from "primereact/dialog";

import backend from "../../app/backend";
import config from "../../app/config";
import AdminTabs from "../../admin/adminTabs";
import { notifySuccess, notifyFailure } from "../../app/notify";

interface AdminRecipeVm {
    id: number;
    title: string;
    description: string | null;
    status: string;
    average_Rating: number;
    categories: string[];
}

function AdminRecipesList() {
    const [recipes, setRecipes] = useState<AdminRecipeVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // delete dialog state
    const [isDeleting, setIsDeleting] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState<AdminRecipeVm | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);

        backend
            .get(config.backendUrl + "/recipes") // GET /api/recipes
            .then((response) => {
                setRecipes(response.data as AdminRecipeVm[]);
            })
            .catch((err) => {
                console.error("Failed to load recipes:", err);
                setError("Could not load recipes. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, []);

    // open confirmation dialog (called from Delete button)
    const openDeleteDialog = (recipe: AdminRecipeVm) => {
        setRecipeToDelete(recipe);
        setIsDeleting(true);
    };

    // confirm delete, like template's onDelete()
    const confirmDelete = async () => {
        if (!recipeToDelete) return;

        setIsDeleting(false);

        try {
            await backend.delete(config.backendUrl + `/recipes/${recipeToDelete.id}`);
            // remove from local state
            setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id));

            notifySuccess("Recipe deleted.");
        } catch (err) {
            console.error("Failed to delete recipe:", err);
            const msg =
                `Deletion of recipe '${recipeToDelete.id}' has failed. ` +
                `Either this recipe cannot be deleted or there was a backend failure.`;
            notifyFailure(msg);
        } finally {
            setRecipeToDelete(null);
        }
    };

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
                        + New Recipe
                    </button>
                </div>
            </div>

            {/* Admin tabs */}
            <AdminTabs />

            {/* Delete confirmation dialog (like in EntityList) */}
            <Dialog
                visible={isDeleting}
                onHide={() => setIsDeleting(false)}
                header={<span className="me-2">Confirm recipe deletion</span>}
                style={{ width: "50ch" }}
            >
                <div className="alert alert-warning">
                    Do you really want to delete the following recipe?
                </div>

                <label htmlFor="id" className="form-label">
                    ID:
                </label>
                <div id="id">{recipeToDelete?.id}</div>

                <label htmlFor="title" className="form-label mt-2">
                    Title:
                </label>
                <div id="title">{recipeToDelete?.title}</div>

                <label htmlFor="status" className="form-label mt-2">
                    Status:
                </label>
                <div id="status">{recipeToDelete?.status}</div>

                <label htmlFor="categories" className="form-label mt-2">
                    Categories:
                </label>
                <div id="categories">
                    {recipeToDelete?.categories?.length
                        ? recipeToDelete.categories.join(", ")
                        : "Uncategorized"}
                </div>

                <div className="d-flex justify-content-end mt-3">
                    <button
                        type="button"
                        className="btn btn-primary me-2"
                        onClick={confirmDelete}
                    >
                        Confirm
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsDeleting(false)}
                    >
                        Cancel
                    </button>
                </div>
            </Dialog>

            {/* List */}
            {recipes.length === 0 ? (
                <p>No recipes found.</p>
            ) : (
                <table className="table table-striped table-hover align-middle">
                    <thead>
                    <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th>Title</th>
                        <th style={{ width: "120px" }}>Status</th>
                        <th style={{ width: "140px" }}>Rating</th>
                        <th>Categories</th>
                        <th style={{ width: "150px" }} className="text-end">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {recipes.map((recipe) => (
                        <tr key={recipe.id}>
                            <td>{recipe.id}</td>
                            <td>{recipe.title}</td>
                            <td>{recipe.status}</td>
                            <td>{recipe.average_Rating.toFixed(1)}</td>
                            <td>
                                {recipe.categories?.length
                                    ? recipe.categories.join(", ")
                                    : "Uncategorized"}
                            </td>
                            <td className="text-end">
                                <Link
                                    to={`./edit/${recipe.id}`}
                                    className="btn btn-sm btn-primary me-2"
                                >
                                    Edit
                                </Link>

                                {/* Button stays the same visually, but now opens dialog */}
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => openDeleteDialog(recipe)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminRecipesList;
