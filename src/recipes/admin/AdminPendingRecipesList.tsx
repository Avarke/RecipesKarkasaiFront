import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import backend from "../../app/backend";
import config from "../../app/config";
import AdminTabs from "../../admin/adminTabs";
import { notifyFailure, notifySuccess } from "../../app/notify";

interface RecipeVm {
    id: number;
    title: string;
    description: string;
    status: string;
    average_Rating: number;
    categories: string[];
    imageBase64?: string | null;
    requestMessage?: string | null;
}

function AdminPendingRecipesList() {
    const [recipes, setRecipes] = useState<RecipeVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const navigate = useNavigate();

    const load = () => {
        setLoading(true);
        setErr(null);

        backend
            .get<RecipeVm[]>(`${config.backendUrl}/recipes/pending`)
            .then((res) => setRecipes(res.data))
            .catch((e) => {
                console.error(e);
                setErr("Failed to load pending recipes.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const moderate = (id: number, decision: "accept" | "deny") => {
        setBusyId(id);

        backend
            .patch(`${config.backendUrl}/recipes/${id}/moderation`, { decision })
            .then(() => {
                notifySuccess(decision === "accept" ? "Recipe accepted." : "Recipe denied.");
                // remove from list immediately (snappy) + optionally re-load to be safe
                setRecipes((prev) => prev.filter((r) => r.id !== id));
            })
            .catch((e) => {
                console.error(e);
                const msg = e?.response?.data?.message ?? "Moderation failed.";
                notifyFailure(msg);
            })
            .finally(() => setBusyId(null));
    };

    return (
        <div className="container py-4" style={{ maxWidth: "900px" }}>
            <AdminTabs />

            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Pending Recipes</h3>
                <button className="btn btn-outline-secondary btn-sm" onClick={load} disabled={loading}>
                    Refresh
                </button>
            </div>

            {loading && <p>Loading pending recipes...</p>}

            {!loading && err && <div className="alert alert-danger">{err}</div>}

            {!loading && !err && recipes.length === 0 && (
                <div className="alert alert-success">No pending recipes 🎉</div>
            )}

            {!loading &&
                !err &&
                recipes.map((r) => (
                    <div key={r.id} className="card mb-3">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div style={{ flex: 1 }}>
                                    <h5 className="card-title mb-1">{r.title}</h5>

                                    <div className="small text-muted mb-2">
                                        Status: <span className="badge bg-warning text-dark">{r.status}</span>
                                    </div>

                                    {r.categories?.length > 0 && (
                                        <div className="mb-2">
                                            {r.categories.map((c) => (
                                                <span key={c} className="badge bg-secondary me-1">
                          {c}
                        </span>
                                            ))}
                                        </div>
                                    )}

                                    {r.requestMessage && (
                                        <div className="alert alert-info py-2 mb-2">
                                            <strong>Request message:</strong> {r.requestMessage}
                                        </div>
                                    )}

                                    {r.description && <p className="card-text">{r.description}</p>}
                                </div>

                                {r.imageBase64 && (
                                    <img
                                        src={r.imageBase64}
                                        alt="recipe"
                                        className="ms-3 rounded"
                                        style={{ width: "110px", height: "110px", objectFit: "cover" }}
                                    />
                                )}
                            </div>

                            <div className="d-flex gap-2 mt-3">
                                <button
                                    className="btn btn-success"
                                    disabled={busyId === r.id}
                                    onClick={() => moderate(r.id, "accept")}
                                >
                                    {busyId === r.id ? "Working..." : "Accept"}
                                </button>

                                <button
                                    className="btn btn-danger"
                                    disabled={busyId === r.id}
                                    onClick={() => moderate(r.id, "deny")}
                                >
                                    {busyId === r.id ? "Working..." : "Deny"}
                                </button>

                                <button
                                    className="btn btn-outline-primary ms-auto"
                                    onClick={() => navigate(`/admin/recipes/edit/${r.id}`)}
                                >
                                    Review / Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
}

export default AdminPendingRecipesList;
