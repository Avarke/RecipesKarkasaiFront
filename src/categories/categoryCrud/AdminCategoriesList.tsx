import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog } from "primereact/dialog";

import backend from "../../app/backend";
import config from "../../app/config";
import AdminTabs from "../../admin/adminTabs";
import { notifySuccess, notifyFailure } from "../../app/notify";

interface AdminCategoryVm {
    id: number;
    name: string;
    description?: string | null;
}

function AdminCategoriesList() {
    const [categories, setCategories] = useState<AdminCategoryVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Delete dialog state
    const [isDeleting, setIsDeleting] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<AdminCategoryVm | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        backend
            .get(config.backendUrl + "/categories") // GET /api/categories
            .then((res) => {
                setCategories(res.data as AdminCategoryVm[]);
            })
            .catch((err) => {
                console.error("Failed to load categories:", err);
                setError("Could not load categories.");
            })
            .finally(() => setLoading(false));
    }, []);

    // open dialog from Delete button
    const openDeleteDialog = (cat: AdminCategoryVm) => {
        setCategoryToDelete(cat);
        setIsDeleting(true);
    };

    // confirm deletion, like onDelete in the template
    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(false);

        try {
            await backend.delete(config.backendUrl + `/categories/${categoryToDelete.id}`);
            setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));

            notifySuccess("Category deleted.");
        } catch (err: any) {
            console.error("Failed to delete category:", err);

            const backendMsg =
                err?.response?.data?.message ||
                err?.response?.data?.detail; // in case you used ProblemDetails

            if (backendMsg) {
                notifyFailure(backendMsg);
            } else {
                notifyFailure(
                    `Deletion of category '${categoryToDelete.id}' has failed. ` +
                    "Either this category cannot be deleted or there was a backend failure."
                );
            }
        } finally {
            setCategoryToDelete(null);
        }
    };

    if (loading) return <p className="text-center mt-5">Loading categories...</p>;
    if (error) return <p className="text-center text-danger mt-5">{error}</p>;

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Admin – Categories</h2>
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
                        + New Category
                    </button>
                </div>
            </div>

            {/* Admin tabs */}
            <AdminTabs />

            {/* Delete confirmation dialog */}
            <Dialog
                visible={isDeleting}
                onHide={() => setIsDeleting(false)}
                header={<span className="me-2">Confirm category deletion</span>}
                style={{ width: "50ch" }}
            >
                <div className="alert alert-warning">
                    Do you really want to delete the following category?
                </div>

                <label htmlFor="id" className="form-label">
                    ID:
                </label>
                <div id="id">{categoryToDelete?.id}</div>

                <label htmlFor="name" className="form-label mt-2">
                    Name:
                </label>
                <div id="name">{categoryToDelete?.name}</div>

                <label htmlFor="description" className="form-label mt-2">
                    Description:
                </label>
                <div id="description">{categoryToDelete?.description || "-"}</div>

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
            {categories.length === 0 ? (
                <p>No categories found.</p>
            ) : (
                <table className="table table-striped table-hover align-middle">
                    <thead>
                    <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th style={{ width: "160px" }} className="text-end">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {categories.map((cat) => (
                        <tr key={cat.id}>
                            <td>{cat.id}</td>
                            <td>{cat.name}</td>
                            <td>{cat.description || "-"}</td>
                            <td className="text-end">
                                <Link
                                    to={`./edit/${cat.id}`}
                                    className="btn btn-sm btn-primary me-2"
                                >
                                    Edit
                                </Link>
                                {/* Visual button stays identical – just opens dialog now */}
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => openDeleteDialog(cat)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminCategoriesList;
