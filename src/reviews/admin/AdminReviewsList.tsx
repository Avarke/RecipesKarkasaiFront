import { useNavigate } from "react-router-dom";
import AdminTabs from "../../admin/adminTabs";

import { useReviewList } from "../hooks/useReviewList";
import ReviewDeleteDialog from "../components/ReviewDeleteDialog";
import ReviewTable from "../components/ReviewTable";

function AdminReviewsList() {
    const navigate = useNavigate();

    const {
        reviews, loading, error,
        editingId, editingRating, setEditingRating,
        editingComment, setEditingComment,
        startEdit, cancelEdit, saveEdit,
        isDeleting, reviewToDelete,
        openDeleteDialog, closeDeleteDialog, confirmDelete,
    } = useReviewList("/reviews");

    if (loading) return <p className="text-center mt-5">Loading reviews...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Admin – Reviews</h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/recipes")}>
                        Back to public recipes
                    </button>
                    <button className="btn btn-success btn-sm" onClick={() => navigate("./create")}>
                        + New Review
                    </button>
                </div>
            </div>

            <AdminTabs />

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

export default AdminReviewsList;
