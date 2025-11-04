import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import backend from "../app/backend";
import config from "../app/config";
import "./RecipesList.scss";

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

    const location = useLocation();

    // extract ?category=... from the URL
    const searchParams = new URLSearchParams(location.search);
    const selectedCategory = searchParams.get("category");

    useEffect(() => {
        setLoading(true);

        backend
            .get(config.backendUrl + "/recipes")
            .then((response) => {
                let allRecipes = response.data as RecipeVm[];

                if (selectedCategory) {
                    allRecipes = allRecipes.filter((r) =>
                        r.categories.includes(selectedCategory)
                    );
                }

                setRecipes(allRecipes);
            })
            .catch((err) => {
                console.error("Failed to load recipes:", err);
                setError("Could not load recipes. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, [selectedCategory]); // re-run when category changes

    if (loading) return <p className="text-center mt-5">Loading recipes...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;

    return (
        <div className="container recipes-container">
            <h2>
                {selectedCategory ? `${selectedCategory} Recipes` : "All Recipes"}
            </h2>

            {recipes.length === 0 ? (
                <p>No recipes found.</p>
            ) : (
                <div className="row">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="col-md-4 mb-4">
                            <div className="recipe-card card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{recipe.title}</h5>
                                    <p className="card-text">{recipe.description}</p>
                                    <p><strong>Status:</strong> {recipe.status}</p>
                                    <p><strong>Rating:</strong> {recipe.average_Rating}</p>
                                    <p>
                                        <strong>Categories:</strong>{" "}
                                        {recipe.categories?.length > 0
                                            ? recipe.categories.join(", ")
                                            : "None"}
                                    </p>

                                    <div className="text-end mt-3">
                                        <button className="btn view-btn">View Recipe</button>
                                    </div>
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
