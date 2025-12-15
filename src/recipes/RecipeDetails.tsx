import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import backend from "../app/backend";
import config from "../app/config";
import "./RecipeDetails.scss";
import {PublishStatus} from "./models/PublishStatus";

interface RecipeVm {
    id: number;
    title: string;
    description: string | null;
    publish_status: PublishStatus;
    average_rating: number;
    categoryId: number;
    categoryName: string;
    image_url?: string | null;
}

interface ReviewVm {
    id: number;
    rating: number;
    comment: string | null;
    recipeId: number;
    recipeTitle: string;
    userId: string;
    userName: string;
    // your ReviewDto might also include user fields; add if needed
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
            .get<RecipeVm>(`/recipes/${id}`)
            .then((res) => setRecipe(res.data))
            .catch((err) => {
                console.error("Error fetching recipe", err);
                setError("Failed to load recipe details");
            })
            .finally(() => setLoadingRecipe(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;

        setLoadingReviews(true);
        backend
            .get<ReviewVm[]>(`/recipes/${id}/reviews`) // ✅ correct route
            .then((res) => setReviews(res.data))
            .catch((err) => {
                console.error("Failed to load reviews", err);
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
                {recipe.image_url ? (
                    <img
                        src={
                            recipe.image_url.startsWith("http")
                                ? recipe.image_url
                                : `${config.backendUrl}${recipe.image_url}`
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
                        {recipe.average_rating.toFixed(1)}
                    </p>
                    <p className="text-muted mb-2">
                        <strong>Status:</strong> {PublishStatus[recipe.publish_status]}
                    </p>
                    <p className="text-muted mb-2">
                        <strong>Category:</strong> {recipe.categoryName}
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
                            <li key={rev.id} className="list-group-item">
                                <div className="d-flex justify-content-between">
                                    <strong>⭐ {rev.rating}</strong>
                                    <span className="text-muted">@{rev.userName}</span>
                                </div>

                                <div className="mt-1">
                                    {rev.comment?.trim()
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
