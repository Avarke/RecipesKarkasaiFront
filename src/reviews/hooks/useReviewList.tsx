import { useEffect, useState } from "react";
import backend from "../../app/backend";
import config from "../../app/config";
import { notifyFailure, notifySuccess } from "../../app/notify";
import { ReviewListVm } from "../models/ReviewListVm";

export function useReviewList(getPath: string) {
    const [reviews, setReviews] = useState<ReviewListVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // inline edit
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingRating, setEditingRating] = useState(0);
    const [editingComment, setEditingComment] = useState("");

    // delete dialog
    const [isDeleting, setIsDeleting] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<ReviewListVm | null>(null);

    useEffect(() => {
        setLoading(true);
        backend
            .get(config.backendUrl + getPath)
            .then((res) => setReviews(res.data as ReviewListVm[]))
            .catch((err) => {
                console.error("Failed to load reviews:", err);
                setError("Could not load reviews.");
            })
            .finally(() => setLoading(false));
    }, [getPath]);

    const startEdit = (review: ReviewListVm) => {
        setEditingId(review.id);
        setEditingRating(review.rating);
        setEditingComment(review.comment ?? "");
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
                        ? { ...r, rating: editingRating, comment: editingComment }
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

    const openDeleteDialog = (review: ReviewListVm) => {
        setReviewToDelete(review);
        setIsDeleting(true);
    };

    const closeDeleteDialog = () => setIsDeleting(false);

    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        setIsDeleting(false);

        try {
            await backend.delete(config.backendUrl + `/reviews/${reviewToDelete.id}`);
            setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
            notifySuccess("Review deleted.");
        } catch (err) {
            console.error("Failed to delete review:", err);
            notifyFailure(
                `Deletion of review '${reviewToDelete.id}' has failed. Either this review cannot be deleted or there was a backend failure.`
            );
        } finally {
            setReviewToDelete(null);
        }
    };

    return {
        reviews,
        loading,
        error,

        // edit state + handlers
        editingId,
        editingRating,
        setEditingRating,
        editingComment,
        setEditingComment,
        startEdit,
        cancelEdit,
        saveEdit,

        // delete state + handlers
        isDeleting,
        reviewToDelete,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
    };
}
