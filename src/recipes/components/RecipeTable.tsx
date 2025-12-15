import { Link } from "react-router-dom";
import { RecipeListVm } from "../models/RecipeListVm";
import {PublishStatusText} from "../models/PublishStatus";

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
                <th>Category</th>
                <th style={{ width: "150px" }} className="text-end">Actions</th>
            </tr>
            </thead>
            <tbody>
            {recipes.map((recipe) => (
                <tr key={recipe.id}>
                    <td>{recipe.id}</td>
                    <td>{recipe.title}</td>
                    <td>{PublishStatusText[recipe.publish_status]}</td>
                    <td>{recipe.average_rating.toFixed(1)}</td>
                    <td>{recipe.categoryName || "Uncategorized"}</td>
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