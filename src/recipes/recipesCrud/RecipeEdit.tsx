// src/recipes/RecipeEdit.tsx
// Refactored for the "new backend" where:
// - Recipe has NO ingredients
// - Recipe has ONE category (CategoryId)
// - Endpoints are under /api
// - PUT expects at least: { title?, description?, categoryId? } (we'll send title+description+categoryId)

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import backend from "../../app/backend";
import { notifySuccess } from "../../app/notify";

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import appState from "../../app/appState";
import config from "../../app/config";

interface RecipeVm {
    id: number;
    title: string;
    description: string | null;

    // new backend model
    categoryId: number;
    image_url?: string | null;

    // optionally the API might return a category object instead:
    // category?: { id: number; name: string };
}

interface CategoryVm {
    id: number;
    name: string;
}

class State {
    isInitialized = false;
    isLoading = false;
    isLoaded = false;

    id: number = -1;
    title: string = "";
    description: string = "";
    categoryId: number | null = null;

    categories: { label: string; value: number }[] = [];

    isSaveErr = false;

    // backend validation messages
    titleErrorMsg: string | null = null;
    descriptionErrorMsg: string | null = null;
    categoryErrorMsg: string | null = null;

    image_url: string | null = null;        // from API
    imageFile: File | null = null;          // selected file
    imagePreviewUrl: string | null = null;  // local preview
    imageErrorMsg: string | null = null;
    isImageUploading: boolean = false;
    isSaving: boolean = false;

    resetErrors() {
        this.isSaveErr = false;
        this.titleErrorMsg = null;
        this.descriptionErrorMsg = null;
        this.categoryErrorMsg = null;
        this.imageErrorMsg = null;
    }

    shallowClone(): State {
        return Object.assign(new State(), this);
    }


}

function RecipeEdit() {
    const [state, setState] = useState(new State());
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const updateState = (updater: (s: State) => void) => {
        setState((s) => {
            updater(s);
            return s.shallowClone();
        });
    };

    // Initial load (useEffect instead of "if !initialized" to avoid double fetch in StrictMode)
    useEffect(() => {
        if (!id) return;

        updateState((s) => {
            s.isInitialized = true;
            s.isLoading = true;
            s.isLoaded = false;
            s.resetErrors();
        });

        Promise.all([
            backend.get<RecipeVm>(`/recipes/${id}`),
            backend.get<CategoryVm[]>(`/categories`),
        ])
            .then(([recipeRes, catRes]) => {
                const recipeData = recipeRes.data;
                const cats = catRes.data;

                updateState((s) => {
                    s.isLoading = false;
                    s.isLoaded = true;

                    s.id = recipeData.id;
                    s.title = recipeData.title;
                    s.description = recipeData.description ?? "";
                    s.categoryId = recipeData.categoryId ?? null;

                    s.image_url = recipeData.image_url ?? null;
                    s.imageFile = null;

                    s.categories = cats.map((c) => ({ label: c.name, value: c.id }));
                });
            })
            .catch((err) => {
                console.error("Failed to load recipe data:", err);
                updateState((s) => {
                    s.isLoading = false;
                    s.isLoaded = false;
                });
            });
    }, [id]);

    const onSave = async () => {
        // prevent double submit
        if (state.isSaving || state.isImageUploading) return;

        // reset errors + start saving immediately (this is what makes disable work)
        updateState((s) => {
            s.resetErrors();
            s.isSaving = true;
        });

        const titleTrim = state.title.trim();
        const descTrim = state.description.trim();

        // client validation
        if (titleTrim === "" || state.categoryId === null) {
            updateState((s) => {
                if (titleTrim === "") s.titleErrorMsg = "Title cannot be empty.";
                if (s.categoryId === null) s.categoryErrorMsg = "Please select a category.";
                s.isSaving = false; // stop saving because we won't do requests
            });
            return;
        }

        const payload = {
            title: titleTrim,
            description: descTrim === "" ? null : descTrim,
            categoryId: state.categoryId,
        };

        try {
            // 1) update recipe fields
            await backend.put(`/recipes/${state.id}`, payload);

            // 2) upload image if selected
            if (state.imageFile) {
                updateState((s) => {
                    s.isImageUploading = true;
                    s.imageErrorMsg = null;
                });

                const fd = new FormData();
                fd.append("file", state.imageFile);

                const res = await backend.post(`/recipes/${state.id}/image`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                const newImageUrl = res?.data?.image_url as string | undefined;

                updateState((s) => {
                    s.isImageUploading = false;

                    // refresh image url if backend returned it
                    if (newImageUrl) s.image_url = newImageUrl;

                    // clear selection + preview
                    if (s.imagePreviewUrl) URL.revokeObjectURL(s.imagePreviewUrl);
                    s.imagePreviewUrl = null;
                    s.imageFile = null;
                });
            }

            notifySuccess("Recipe updated.");
            navigate(appState.isAdmin ? "/admin/recipes" : "/user/recipes", { state: "refresh" });
        } catch (err: any) {
            console.error("Update failed:", err);

            const status = err?.response?.status;
            const errors = err?.response?.data?.errors;

            // common: image too large
            if (status === 413) {
                updateState((s) => {
                    s.imageErrorMsg = "Image is too large.";
                });
                return;
            }

            if (errors) {
                updateState((s) => {
                    if (errors.Title?.[0]) s.titleErrorMsg = errors.Title[0];
                    if (errors.Description?.[0]) s.descriptionErrorMsg = errors.Description[0];
                    if (errors.CategoryId?.[0]) s.categoryErrorMsg = errors.CategoryId[0];
                });
                return;
            }

            updateState((s) => {
                s.isSaveErr = true;
            });
        } finally {
            // always release locks
            updateState((s) => {
                s.isSaving = false;
                s.isImageUploading = false; // safe even if it wasn't uploading
            });
        }
    };

    // render states
    if (state.isLoading) {
        return <p className="text-center mt-5">Loading recipe...</p>;
    }

    if (state.isInitialized && !state.isLoading && !state.isLoaded) {
        return (
            <p className="text-center text-danger mt-5">
                Backend failure, please try again...
            </p>
        );
    }

    if (!state.isLoaded) return null;

    return (
        <div className="container py-5" style={{ maxWidth: "700px" }}>
            <h2>Edit Recipe: {state.title}</h2>

            {state.isSaveErr && (
                <div className="alert alert-warning mt-3">
                    Saving failed due to backend failure. Please, wait a little and retry.
                </div>
            )}

            <form
                className="mt-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave();
                }}
            >
                {/* Title */}
                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <InputText
                        className={"form-control " + (state.titleErrorMsg ? "is-invalid" : "")}
                        value={state.title}
                        onChange={(e) => updateState((s) => (s.title = e.target.value))}
                    />
                    {state.titleErrorMsg && (
                        <div className="invalid-feedback d-block">{state.titleErrorMsg}</div>
                    )}
                </div>

                {/* Description */}
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <InputTextarea
                        rows={4}
                        className={
                            "form-control " + (state.descriptionErrorMsg ? "is-invalid" : "")
                        }
                        value={state.description}
                        onChange={(e) => updateState((s) => (s.description = e.target.value))}
                    />
                    {state.descriptionErrorMsg && (
                        <div className="invalid-feedback d-block">{state.descriptionErrorMsg}</div>
                    )}
                </div>

                {/* Category (single select) */}
                <div className="mb-3">
                    <label className="form-label">Category</label>
                    <Dropdown
                        value={state.categoryId}
                        options={state.categories}
                        onChange={(e) => updateState((s) => (s.categoryId = e.value as number))}
                        optionLabel="label"
                        placeholder="Select a category"
                        filter
                        className={"w-100 " + (state.categoryErrorMsg ? "is-invalid" : "")}
                    />
                    {state.categoryErrorMsg && (
                        <div className="invalid-feedback d-block">{state.categoryErrorMsg}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Image</label>

                    {(state.imagePreviewUrl || state.image_url) && (
                        <div className="mb-2">
                            <img
                                alt="recipe"
                                style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 8 }}
                                src={
                                    state.imagePreviewUrl ??
                                    (state.image_url!.startsWith("http")
                                        ? state.image_url!
                                        : `${config.backendUrl}${state.image_url}`)
                                }
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        className={"form-control " + (state.imageErrorMsg ? "is-invalid" : "")}
                        onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;

                            updateState((s) => {
                                s.imageErrorMsg = null;

                                // clean old preview if any
                                if (s.imagePreviewUrl) URL.revokeObjectURL(s.imagePreviewUrl);

                                s.imageFile = f;
                                s.imagePreviewUrl = f ? URL.createObjectURL(f) : null;
                            });
                        }}
                    />

                    {state.imageErrorMsg && (
                        <div className="invalid-feedback d-block">{state.imageErrorMsg}</div>
                    )}

                    {state.isImageUploading && (
                        <div className="text-muted mt-2">Uploading image...</div>
                    )}
                </div>


                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={state.isSaving || state.isImageUploading}
                >
                    {(state.isSaving || state.isImageUploading) ? "Saving..." : "Save Changes"}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => {
                        if (appState.isAdmin) {
                            navigate("/admin/recipes");
                        } else {
                            navigate("/user/recipes");
                        }
                    }}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default RecipeEdit;
