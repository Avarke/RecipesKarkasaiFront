import { Link } from "react-router-dom";
import { RecipeListVm } from "../models/RecipeListVm";

type Props = {
    recipes: RecipeListVm[];
    onDelete: (r: RecipeListVm) => void;
    editPath: (id: number) => string; // allows admin/user to decide route base
};

export default function RecipeTable({ recipes, onDelete, editPath }: Props) {
    if (recipes.length === 0) return <p>No recipes found.</p>;

    return (
        <table className="table table-striped table-hover align-middle">
            <thead>
            <tr>
                <th style={{ width: "60px" }}>ID</th>
                <th>Title</th>
                <th style={{ width: "120px" }}>Status</th>
                <th style={{ width: "140px" }}>Rating</th>
                <th>Categories</th>
                <th style={{ width: "150px" }} className="text-end">Actions</th>
            </tr>
            </thead>
            <tbody>
            {recipes.map((recipe) => (
                <tr key={recipe.id}>
                    <td>{recipe.id}</td>
                    <td>{recipe.title}</td>
                    <td>{recipe.status}</td>
                    <td>{recipe.average_Rating.toFixed(1)}</td>
                    <td>{recipe.categories?.length ? recipe.categories.join(", ") : "Uncategorized"}</td>
                    <td className="text-end">
                        <Link to={editPath(recipe.id)} className="btn btn-sm btn-primary me-2">
                            Edit
                        </Link>
                        <button className="btn btn-sm btn-danger" onClick={() => onDelete(recipe)}>
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}