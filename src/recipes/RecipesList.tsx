import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import backend from "../app/backend";
import config from "../app/config";
import "./RecipesList.scss";
import StarRating from "./StarRating";


interface RecipeVm {
    id: number;
    title: string;
    description: string;
    status: string;
    average_Rating: number;
    categories: string[];
    imageBase64?: string | null;   // ✅ new
}

function RecipesList() {
    const [recipes, setRecipes] = useState<RecipeVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortBy, setSortBy] = useState<"default" | "rating" | "title">("default");


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

                if (sortBy === "rating") {
                    allRecipes = [...allRecipes].sort(
                        (a, b) => b.average_Rating - a.average_Rating
                    );
                } else if (sortBy === "title") {
                    allRecipes = [...allRecipes].sort((a, b) =>
                        a.title.localeCompare(b.title)
                    );
                }

                setRecipes(allRecipes);
            })
            .catch((err) => {
                console.error("Failed to load recipes:", err);
                setError("Could not load recipes. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, [selectedCategory, sortBy]);

    if (loading) return <p className="text-center mt-5">Loading recipes...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;

    return (
        <div className="container recipes-container">
            <div className="recipes-header d-flex justify-content-between align-items-center mb-4">
                {/* Page title */}
                <h2 className="recipes-title mb-0">
                    {selectedCategory ? `${selectedCategory} Recipes` : "All Recipes"}
                </h2>

                {/* Filter dropdowns */}
                <div className="filters d-flex align-items-center gap-3">
                    {/* Category filter */}
                    <div className="filter-item d-flex align-items-center gap-2">
                        <label htmlFor="category" className="text-muted">Category:</label>
                        <select
                            id="category"
                            className="form-select form-select-sm w-auto"
                            value={selectedCategory || ""}
                            onChange={(e) => {
                                const cat = e.target.value;
                                window.location.href = cat
                                    ? `/recipes?category=${encodeURIComponent(cat)}`
                                    : "/recipes";
                            }}
                        >
                            <option value="">All</option>
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Desserts">Desserts</option>
                        </select>
                    </div>


                    <div className="filter-item d-flex align-items-center gap-2">
                        <label htmlFor="sort" className="text-muted">Sort by:</label>
                        <select
                            id="sort"
                            className="form-select form-select-sm w-auto"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "default" | "rating" | "title")}
                        >
                            <option value="default">Default</option>
                            <option value="rating">Rating</option>
                            <option value="title">Title</option>
                        </select>
                    </div>
                </div>
            </div>

            {recipes.length === 0 ? (
                <p>No recipes found.</p>
            ) : (
                <div className="row g-4">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="col-md-4 mb-4">
                            <div className="recipe-card card">

                                {recipe.imageBase64 && (
                                    <img
                                        src={
                                            recipe.imageBase64.startsWith("data:")
                                                ? recipe.imageBase64
                                                : `data:image/jpeg;base64,${recipe.imageBase64}`
                                        }
                                        alt={recipe.title}
                                        className="card-img-top recipe-img"
                                    />
                                )}

                                <div className="card-body">
                                    <h5 className="card-title">{recipe.title}</h5>
                                    <div className="rating mb-2">  <StarRating rating={recipe.average_Rating} />
                                    </div>
                                    <p className="categories">
                                        {recipe.categories?.length > 0
                                            ? recipe.categories.join(", ")
                                            : "Uncategorized"}
                                    </p>
                                    <div className="text-end mt-3">
                                        <Link to={`/recipes/${recipe.id}`} className="btn view-btn">
                                            View Recipe
                                        </Link>
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
