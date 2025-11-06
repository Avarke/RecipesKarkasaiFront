import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import backend from "../app/backend";
import config from "../app/config";
import "./RecipeDetails.scss";

interface RecipeVm {
    id: number;
    title: string;
    description: string;
    status: string;
    average_Rating: number;
    categories: string[];
    imageBase64?: string | null;
    userId?: number;
}

function RecipeDetails() {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<RecipeVm | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        backend
            .get(`${config.backendUrl}/recipes/${id}`)
            .then((res) => setRecipe(res.data))
            .catch((err) => {
                console.error("Error fetching recipe", err);
                setError("Failed to load recipe details");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p className="text-center mt-5">Loading...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;
    if (!recipe) return <p className="text-center mt-5">Recipe not found.</p>;

    return (
        <div className="container recipe-details-container py-5">
            <div className="recipe-content">
                {/* Image on the left */}
                {recipe.imageBase64 ? (
                    <img
                        src={
                            recipe.imageBase64.startsWith("data:")
                                ? recipe.imageBase64
                                : `data:image/jpeg;base64,${recipe.imageBase64}`
                        }
                        alt={recipe.title}
                        className="recipe-image rounded shadow-sm"
                    />
                ) : (
                    <div className="no-image">No Image Available</div>
                )}

                <div className="recipe-text">
                    <h2 className="mb-3">{recipe.title}</h2>
                    <p className="text-muted mb-2">
                        <strong>Rating:</strong> ⭐ {recipe.average_Rating.toFixed(1)}
                    </p>
                    <p className="text-muted mb-2">
                        <strong>Status:</strong> {recipe.status}
                    </p>
                    <p className="text-muted mb-2">
                        <strong>Categories:</strong> {recipe.categories.join(", ")}
                    </p>
                    <p className="mt-3 recipe-description">{recipe.description}</p>

                    <Link to="/recipes" className="btn btn-outline-dark mt-4">
                        ← Back to Recipes
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetails;
