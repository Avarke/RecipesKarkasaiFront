import { useNavigate } from "react-router-dom";
import UserTabs from "../../user/userTabs";

import { useReviewList } from "../hooks/useReviewList";
import ReviewDeleteDialog from "../components/ReviewDeleteDialog";
import ReviewTable from "../components/ReviewTable";

function UserReviewsList() {
    const navigate = useNavigate();

    const {
        reviews, loading, error,
        editingId, editingRating, setEditingRating,
        editingComment, setEditingComment,
        startEdit, cancelEdit, saveEdit,
        isDeleting, reviewToDelete,
        openDeleteDialog, closeDeleteDialog, confirmDelete,
    } = useReviewList("/reviews/user");

    if (loading) return <p className="text-center mt-5">Loading reviews...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>User – Reviews</h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/recipes")}>
                        Back to public recipes
                    </button>
                    <button className="btn btn-success btn-sm" onClick={() => navigate("./create")}>
                        + New Review
                    </button>
                </div>
            </div>

            <UserTabs />

            <ReviewDeleteDialog
                visible={isDeleting}
                review={reviewToDelete}
                onHide={closeDeleteDialog}
                onConfirm={confirmDelete}
            />

            <ReviewTable
                reviews={reviews}
                editingId={editingId}
                editingRating={editingRating}
                setEditingRating={setEditingRating}
                editingComment={editingComment}
                setEditingComment={setEditingComment}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
                saveEdit={saveEdit}
                onDelete={openDeleteDialog}
                onNavigateEdit={(id) => navigate(`./edit/${id}`)}
            />
        </div>
    );
}

export default UserReviewsList;
