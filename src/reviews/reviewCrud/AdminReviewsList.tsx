// src/components/AdminReviewsList.tsx

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import backend from "../../app/backend";
import config from "../../app/config";
import AdminTabs from "../../admin/adminTabs";

interface AdminReviewVm {
    id: number;
    rating: number;
    comment: string;
    recipeId: number;
    recipeTitle: string;
}

function AdminReviewsList() {
    const [reviews, setReviews] = useState<AdminReviewVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingRating, setEditingRating] = useState(0);
    const [editingComment, setEditingComment] = useState("");

    useEffect(() => {
        setLoading(true);
        backend
            .get(config.backendUrl + "/reviews")
            .then((res) => {
                setReviews(res.data as AdminReviewVm[]);
            })
            .catch((err) => {
                console.error("Failed to load reviews:", err);
                setError("Could not load reviews.");
            })
            .finally(() => setLoading(false));
    }, []);

    const startEdit = (review: AdminReviewVm) => {
        setEditingId(review.id);
        setEditingRating(review.rating);
        setEditingComment(review.comment);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingRating(0);
        setEditingComment("");
    };

    const saveEdit = async () => {
        if (editingId == null) return;

        try {
            await backend.put(config.backendUrl + `/reviews/${editingId}`, {
                rating: editingRating,
                comment: editingComment
            });

            setReviews((prev) =>
                prev.map((r) =>
                    r.id === editingId
                        ? { ...r, rating: editingRating, comment: editingComment }
                        : r
                )
            );

            cancelEdit();
        } catch (err) {
            console.error("Failed to update review:", err);
            alert("Failed to update review.");
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Delete this review?");
        if (!confirmed) return;

        try {
            await backend.delete(config.backendUrl + `/reviews/${id}`);
            setReviews((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Failed to delete review:", err);
            alert("Failed to delete review.");
        }
    };

    if (loading) return <p className="text-center mt-5">Loading reviews...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Admin – Reviews</h2>
            </div>

            {/* Admin tabs */}
            <AdminTabs />


            {reviews.length === 0 ? (
                <p>No reviews found.</p>
            ) : (
                <table className="table table-striped table-hover align-middle">
                    <thead>
                    <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th style={{ width: "80px" }}>Rating</th>
                        <th>Comment</th>
                        <th>Recipe</th>
                        <th style={{ width: "180px" }} className="text-end">
                            Actions
                        </th>
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
                                        onChange={(e) =>
                                            setEditingRating(
                                                Number(e.target.value)
                                            )
                                        }
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
                                        onChange={(e) =>
                                            setEditingComment(
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    r.comment
                                )}
                            </td>
                            <td>
                                {r.recipeTitle} (#{r.recipeId})
                            </td>
                            <td className="text-end">
                                {editingId === r.id ? (
                                    <>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={saveEdit}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => startEdit(r)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() =>
                                                handleDelete(r.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminReviewsList;
