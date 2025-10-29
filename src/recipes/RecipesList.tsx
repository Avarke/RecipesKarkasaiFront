import { useEffect, useState } from "react";
import backend from "../app/backend";
import config from "../app/config";

interface RecipeVm {
    id: number;
    title: string;
    description: string;
    status: string;
    average_Rating: number;
    categories: string[];
}


function RecipesList() {
    const [recipes, setRecipes] = useState<RecipeVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        backend
            .get(config.backendUrl + "/recipes")
            .then((response) => {
                setRecipes(response.data);
            })
            .catch((err) => {
                console.error("Failed to load recipes:", err);
                setError("Could not load recipes. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-center mt-5">Loading recipes...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;
    return (
        <div className="container py-4">
            <h2 className="mb-4 text-primary">Recipes</h2>
            {recipes.length === 0 ? (
                <p>No recipes found.</p>
            ) : (
                <div className="row">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{recipe.title}</h5>
                                    <p className="card-text text-muted">{recipe.description}</p>
                                    <p><strong>Status:</strong> {recipe.status}</p>
                                    <p><strong>Rating:</strong> {recipe.average_Rating}</p>
                                    <p>
                                        <strong>Categories:</strong>{" "}
                                        {recipe.categories?.length > 0
                                            ? recipe.categories.join(", ")
                                            : "None"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RecipesList;
