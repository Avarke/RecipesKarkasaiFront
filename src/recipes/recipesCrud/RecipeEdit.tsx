// src/recipes/RecipeEdit.tsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import backend from "../../app/backend";
import config from "../../app/config";
import { notifySuccess } from "../../app/notify";

interface RecipeVm {
    id: number;
    title: string;
    description: string;
    status: string;
    average_Rating: number;
    categories: string[];
    imageBase64?: string | null;
}

interface CategoryVm {
    id: number;
    name: string;
}

/**
 * Component state.
 */
class State {
    isInitialized: boolean = false;
    isLoading: boolean = false;
    isLoaded: boolean = false;

    id: number = -1;
    title: string = "";
    description: string = "";
    status: string = "Pending";
    categoryIds: number[] = [];
    imageBase64: string = "";

    categories: CategoryVm[] = [];

    isSaveErr: boolean = false;

    // backend validation messages
    descriptionErrorMsg: string | null = null;
    statusErrorMsg: string | null = null;
    categoryIdsErrorMsg: string | null = null;

    resetErrors() {
        this.isSaveErr = false;
        this.descriptionErrorMsg = null;
        this.statusErrorMsg = null;
        this.categoryIdsErrorMsg = null;
    }

    shallowClone(): State {
        return Object.assign(new State(), this);
    }
}

function RecipeEdit() {
    const [state, setState] = useState(new State());
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const update = (updater: () => void) => {
        updater();
        setState(state.shallowClone());
    };

    const updateState = (updater: (s: State) => void) => {
        setState((s) => {
            updater(s);
            return s.shallowClone();
        });
    };

    // initialize (similar to EntityEdit / CategoryEdit)
    if (!state.isInitialized) {
        update(() => {
            state.isInitialized = true;
            state.isLoading = true;
            state.isLoaded = false;
        });

        // load recipe + categories
        Promise.all([
            backend.get<RecipeVm>(`${config.backendUrl}/recipes/${id}`),
            backend.get<CategoryVm[]>(`${config.backendUrl}/categories`),
        ])
            .then(([recipeRes, catRes]) => {
                const recipeData = recipeRes.data;
                const cats = catRes.data;

                // map recipe category names -> ids
                const mappedIds = recipeData.categories
                    .map((name) => {
                        const cat = cats.find((c) => c.name === name);
                        return cat?.id ?? 0;
                    })
                    .filter((cid) => cid !== 0);

                updateState((s) => {
                    s.isLoading = false;
                    s.isLoaded = true;

                    s.id = recipeData.id;
                    s.title = recipeData.title;
                    s.description = recipeData.description || "";
                    s.status = recipeData.status;
                    s.categoryIds = mappedIds;
                    s.imageBase64 = recipeData.imageBase64 || "";

                    s.categories = cats;
                });
            })
            .catch((err) => {
                console.error("Failed to load recipe or categories:", err);
                updateState((s) => {
                    s.isLoading = false;
                    s.isLoaded = false;
                });
            });
    }

    const onSave = () => {
        update(() => {
            state.resetErrors();

            // build payload for UpdateRecipeVm
            const payload = {
                description:
                    state.description.trim() === ""
                        ? null
                        : state.description.trim(),
                status: state.status,
                categoryIds: state.categoryIds,
                imageBase64:
                    state.imageBase64 && state.imageBase64.trim() !== ""
                        ? state.imageBase64
                        : null,
            };

            backend
                .put(`${config.backendUrl}/recipes/${state.id}`, payload)
                .then(() => {
                    notifySuccess("Recipe updated.");
                    navigate("/admin/recipes", { state: "refresh" });
                })
                .catch((err: any) => {
                    console.error("Update failed:", err);
                    const errors = err?.response?.data?.errors;

                    if (errors) {
                        updateState((s) => {
                            if (errors.Description?.[0]) {
                                s.descriptionErrorMsg = errors.Description[0];
                            }
                            if (errors.Status?.[0]) {
                                s.statusErrorMsg = errors.Status[0];
                            }
                            if (errors.CategoryIds?.[0]) {
                                s.categoryIdsErrorMsg =
                                    errors.CategoryIds[0];
                            }
                        });
                    } else {
                        updateState((s) => {
                            s.isSaveErr = true;
                        });
                    }
                });
        });
    };

    // render
    if (state.isLoading) {
        return (
            <p className="text-center mt-5">Loading recipe...</p>
        );
    }

    if (state.isInitialized && !state.isLoading && !state.isLoaded) {
        return (
            <p className="text-center text-danger mt-5">
                Backend failure, please try again...
            </p>
        );
    }

    if (!state.isLoaded) {
        return null;
    }

    return (
        <div className="container py-5" style={{ maxWidth: "700px" }}>
            <h2>Edit Recipe: {state.title}</h2>

            {state.isSaveErr && (
                <div className="alert alert-warning mt-3">
                    Saving failed due to backend failure. Please, wait a
                    little and retry.
                </div>
            )}

            <form
                className="mt-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave();
                }}
            >
                {/* Description */}
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                        className={
                            "form-control " +
                            (state.descriptionErrorMsg ? "is-invalid" : "")
                        }
                        rows={4}
                        value={state.description}
                        onChange={(e) =>
                            update(
                                () => (state.description = e.target.value)
                            )
                        }
                    />
                    {state.descriptionErrorMsg && (
                        <div className="invalid-feedback">
                            {state.descriptionErrorMsg}
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                        className={
                            "form-select " +
                            (state.statusErrorMsg ? "is-invalid" : "")
                        }
                        value={state.status}
                        onChange={(e) =>
                            update(() => (state.status = e.target.value))
                        }
                    >
                        <option value="Pending">Pending</option>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                    </select>
                    {state.statusErrorMsg && (
                        <div className="invalid-feedback">
                            {state.statusErrorMsg}
                        </div>
                    )}
                </div>

                {/* Categories */}
                <div className="mb-3">
                    <label className="form-label">Categories</label>
                    <select
                        multiple
                        className={
                            "form-select " +
                            (state.categoryIdsErrorMsg ? "is-invalid" : "")
                        }
                        value={state.categoryIds.map(String)}
                        onChange={(e) => {
                            const selected = Array.from(
                                e.target.selectedOptions
                            ).map((opt) => Number(opt.value));
                            update(() => (state.categoryIds = selected));
                        }}
                    >
                        {state.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {state.categoryIdsErrorMsg && (
                        <div className="invalid-feedback">
                            {state.categoryIdsErrorMsg}
                        </div>
                    )}
                </div>

                {/* Image */}
                <div className="mb-3">
                    <label className="form-label">Image</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onloadend = () => {
                                update(
                                    () =>
                                        (state.imageBase64 =
                                            reader.result as string)
                                );
                            };
                            reader.readAsDataURL(file);
                        }}
                    />

                    {state.imageBase64 && (
                        <img
                            src={state.imageBase64}
                            alt="preview"
                            className="mt-3 rounded"
                            style={{ width: "150px" }}
                        />
                    )}
                </div>

                <button className="btn btn-primary" type="submit">
                    Save Changes
                </button>
                <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => navigate("/admin/recipes")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default RecipeEdit;
