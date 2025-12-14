import { ReviewListVm } from "../models/ReviewListVm";

type Props = {
    reviews: ReviewListVm[];

    editingId: number | null;
    editingRating: number;
    setEditingRating: (v: number) => void;
    editingComment: string;
    setEditingComment: (v: string) => void;

    startEdit: (r: ReviewListVm) => void;
    cancelEdit: () => void;
    saveEdit: () => void;

    onDelete: (r: ReviewListVm) => void;
    onNavigateEdit: (id: number) => void;
};

export default function ReviewTable({
                                        reviews,
                                        editingId,
                                        editingRating,
                                        setEditingRating,
                                        editingComment,
                                        setEditingComment,
                                        startEdit,
                                        cancelEdit,
                                        saveEdit,
                                        onDelete,
                                        onNavigateEdit,
                                    }: Props) {
    if (reviews.length === 0) return <p>No reviews found.</p>;

    return (
        <table className="table table-striped table-hover align-middle mt-3">
            <thead>
            <tr>
                <th style={{ width: "60px" }}>ID</th>
                <th style={{ width: "80px" }}>Rating</th>
                <th>Comment</th>
                <th>Recipe</th>
                <th style={{ width: "180px" }} className="text-end">Actions</th>
            </tr>
            </thead>
            <tbody>
            {reviews.map((r) => (
                <tr key={r.id}>
                    <td>{r.id}</td>

                    <td>
                        {editingId === r.id ? (
                            <input
                                type="number"
                                min={1}
                                max={5}
                                className="form-control form-control-sm"
                                value={editingRating}
                                onChange={(e) => setEditingRating(Number(e.target.value))}
                            />
                        ) : (
                            r.rating
                        )}
                    </td>

                    <td>
                        {editingId === r.id ? (
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editingComment}
                                onChange={(e) => setEditingComment(e.target.value)}
                            />
                        ) : (
                            r.comment
                        )}
                    </td>

                    <td>
                        {r.recipeTitle ? `${r.recipeTitle} (#${r.recipeId})` : `#${r.recipeId}`}
                    </td>

                    <td className="text-end">
                        {editingId === r.id ? (
                            <>
                                <button className="btn btn-sm btn-primary me-2" onClick={saveEdit}>
                                    Save
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => onNavigateEdit(r.id)}
                                >
                                    Edit
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => onDelete(r)}>
                                    Delete
                                </button>
                            </>
                        )}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
