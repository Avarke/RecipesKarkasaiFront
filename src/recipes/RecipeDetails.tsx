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

interface ReviewVm {
    id: number;
    rating: number;
    comment: string | null;
    recipeId: number;
    recipeTitle: string;
}

function RecipeDetails() {
    const { id } = useParams<{ id: string }>();

    const [recipe, setRecipe] = useState<RecipeVm | null>(null);
    const [reviews, setReviews] = useState<ReviewVm[]>([]);

    const [loadingRecipe, setLoadingRecipe] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // load recipe
    useEffect(() => {
        if (!id) return;

        setLoadingRecipe(true);
        backend
            .get(`${config.backendUrl}/recipes/${id}`)
            .then((res) => setRecipe(res.data))
            .catch((err) => {
                console.error("Error fetching recipe", err);
                setError("Failed to load recipe details");
            })
            .finally(() => setLoadingRecipe(false));
    }, [id]);

    // load reviews for this recipe
    useEffect(() => {
        if (!id) return;

        setLoadingReviews(true);
        backend
            // backend route: /api/reviews/{recipeId}/reviews
            .get(`${config.backendUrl}/reviews/${id}/reviews`)
            .then((res) => setReviews(res.data as ReviewVm[]))
            .catch((err) => {
                console.error("Failed to load reviews", err);
                // don’t kill the page if reviews fail; just log
            })
            .finally(() => setLoadingReviews(false));
    }, [id]);

    if (loadingRecipe) return <p className="text-center mt-5">Loading...</p>;
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
                        <strong>Rating:</strong> ⭐{" "}
                        {recipe.average_Rating.toFixed(1)}
                    </p>
                    <p className="text-muted mb-2">
                        <strong>Status:</strong> {recipe.status}
                    </p>
                    <p className="text-muted mb-2">
                        <strong>Categories:</strong>{" "}
                        {recipe.categories.join(", ")}
                    </p>
                    <p className="mt-3 recipe-description">
                        {recipe.description}
                    </p>

                    <Link
                        to="/recipes"
                        className="btn btn-outline-dark mt-4"
                    >
                        ← Back to Recipes
                    </Link>
                </div>
            </div>

            {/* Reviews section */}
            <div className="mt-5">
                <h3>Reviews</h3>

                {loadingReviews ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p className="text-muted">No reviews yet.</p>
                ) : (
                    <ul className="list-group">
                        {reviews.map((rev) => (
                            <li
                                key={rev.id}
                                className="list-group-item d-flex flex-column"
                            >
                                <div>
                                    <strong>⭐ {rev.rating}</strong>
                                </div>
                                <div>
                                    {rev.comment && rev.comment.trim() !== ""
                                        ? rev.comment
                                        : <span className="text-muted">No comment</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default RecipeDetails;
