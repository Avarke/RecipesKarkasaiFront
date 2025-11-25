// src/components/AdminReviewsList.tsx



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Dialog } from "primereact/dialog";

import backend from "../../app/backend";
import config from "../../app/config";
import AdminTabs from "../../admin/adminTabs";
import { notifySuccess, notifyFailure } from "../../app/notify";

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

    // delete dialog state (same pattern as AdminRecipesList)
    const [isDeleting, setIsDeleting] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<AdminReviewVm | null>(
        null
    );

    const navigate = useNavigate();

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
                comment: editingComment,
            });

            setReviews((prev) =>
                prev.map((r) =>
                    r.id === editingId
                        ? {
                            ...r,
                            rating: editingRating,
                            comment: editingComment,
                        }
                        : r
                )
            );

            cancelEdit();
            notifySuccess("Review updated.");
        } catch (err) {
            console.error("Failed to update review:", err);
            notifyFailure("Failed to update review.");
        }
    };

    // open confirmation dialog
    const openDeleteDialog = (review: AdminReviewVm) => {
        setReviewToDelete(review);
        setIsDeleting(true);
    };

    // confirm delete, similar to AdminRecipesList.confirmDelete
    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        setIsDeleting(false);

        try {
            await backend.delete(
                config.backendUrl + `/reviews/${reviewToDelete.id}`
            );

            setReviews((prev) =>
                prev.filter((r) => r.id !== reviewToDelete.id)
            );

            notifySuccess("Review deleted.");
        } catch (err) {
            console.error("Failed to delete review:", err);
            const msg =
                `Deletion of review '${reviewToDelete.id}' has failed. ` +
                `Either this review cannot be deleted or there was a backend failure.`;
            notifyFailure(msg);
        } finally {
            setReviewToDelete(null);
        }
    };

    if (loading) return <p className="text-center mt-5">Loading reviews...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;

    return (
        <div className="container mt-4">
            {/* Top header, same structure as AdminRecipesList */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Admin – Reviews</h2>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => navigate("/recipes")}
                    >
                        Back to public recipes
                    </button>

                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => navigate("./create")}
                    >
                        + New Review
                    </button>
                </div>
            </div>

            {/* Admin tabs */}
            <AdminTabs />

            {/* Delete confirmation dialog */}
            <Dialog
                visible={isDeleting}
                onHide={() => setIsDeleting(false)}
                header={<span className="me-2">Confirm review deletion</span>}
                style={{ width: "50ch" }}
            >
                <div className="alert alert-warning">
                    Do you really want to delete the following review?
                </div>

                <label htmlFor="id" className="form-label">
                    ID:
                </label>
                <div id="id">{reviewToDelete?.id}</div>

                <label htmlFor="rating" className="form-label mt-2">
                    Rating:
                </label>
                <div id="rating">{reviewToDelete?.rating}</div>

                <label htmlFor="comment" className="form-label mt-2">
                    Comment:
                </label>
                <div id="comment">
                    {reviewToDelete?.comment || <em>(no comment)</em>}
                </div>

                <label htmlFor="recipe" className="form-label mt-2">
                    Recipe:
                </label>
                <div id="recipe">
                    {reviewToDelete
                        ? `${reviewToDelete.recipeTitle} (#${reviewToDelete.recipeId})`
                        : ""}
                </div>

                <div className="d-flex justify-content-end mt-3">
                    <button
                        type="button"
                        className="btn btn-primary me-2"
                        onClick={confirmDelete}
                    >
                        Confirm
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsDeleting(false)}
                    >
                        Cancel
                    </button>
                </div>
            </Dialog>

            {/* List */}
            {reviews.length === 0 ? (
                <p>No reviews found.</p>
            ) : (
                <table className="table table-striped table-hover align-middle mt-3">
                    <thead>
                    <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th style={{ width: "80px" }}>Rating</th>
                        <th>Comment</th>
                        <th>Recipe</th>
                        <th
                            style={{ width: "180px" }}
                            className="text-end"
                        >
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
                                {r.recipeTitle ? `${r.recipeTitle} (#${r.recipeId})` : `#${r.recipeId}`}
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
                                            onClick={() => navigate(`./edit/${r.id}`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() =>
                                                openDeleteDialog(r)
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
