import { Dialog } from "primereact/dialog";
import { RecipeListVm } from "../models/RecipeListVm";

type Props = {
    visible: boolean;
    recipe: RecipeListVm | null;
    onHide: () => void;
    onConfirm: () => void;
};

export default function RecipeDeleteDialog({ visible, recipe, onHide, onConfirm }: Props) {
    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={<span className="me-2">Confirm recipe deletion</span>}
            style={{ width: "50ch" }}
        >
            <div className="alert alert-warning">
                Do you really want to delete the following recipe?
            </div>

            <label className="form-label">ID:</label>
            <div>{recipe?.id}</div>

            <label className="form-label mt-2">Title:</label>
            <div>{recipe?.title}</div>

            <label className="form-label mt-2">Status:</label>
            <div>{recipe?.publish_status}</div>

            <label className="form-label mt-2">Categories:</label>
            <div>
                {recipe?.categoryName || "Uncategorized"}
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