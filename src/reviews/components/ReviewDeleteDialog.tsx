import { Dialog } from "primereact/dialog";
import { ReviewListVm } from "../models/ReviewListVm";

type Props = {
    visible: boolean;
    review: ReviewListVm | null;
    onHide: () => void;
    onConfirm: () => void;
};

export default function ReviewDeleteDialog({ visible, review, onHide, onConfirm }: Props) {
    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={<span className="me-2">Confirm review deletion</span>}
            style={{ width: "50ch" }}
        >
            <div className="alert alert-warning">
                Do you really want to delete the following review?
            </div>

            <label className="form-label">ID:</label>
            <div>{review?.id}</div>

            <label className="form-label mt-2">Rating:</label>
            <div>{review?.rating}</div>

            <label className="form-label mt-2">Comment:</label>
            <div>{review?.comment || <em>(no comment)</em>}</div>

            <label className="form-label mt-2">Recipe:</label>
            <div>
                {review ? `${review.recipeTitle} (#${review.recipeId})` : ""}
            </div>

            <div className="d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-primary me-2" onClick={onConfirm}>
                    Confirm
                </button>
                <button type="button" className="btn btn-secondary" onClick={onHide}>
                    Cancel
                </button>
            </div>
        </Dialog>
    );
}
