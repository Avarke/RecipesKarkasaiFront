// src/components/recipes/RecipeCreate.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";

import backend from "../../app/backend";
import { notifySuccess } from "../../app/notify";
import appState from "../../app/appState";

/**
 * This refactor targets the "new backend" where:
 * - A recipe has NO ingredients
 * - A recipe has ONE category (CategoryId)
 * - POST expects: { title, description, categoryId }
 * - Endpoints live under /api
 */


class State {
    title: string = "";
    description: string = "";
    categoryId: number | null = null;

    categoriesList: { label: string; value: number }[] = [];

    // client-side errors
    isTitleErr = false;
    isSaveErr = false;
    isCategoryErr = false;

    titleErrorMsg: string | null = null;
    descriptionErrorMsg: string | null = null;
    categoryErrorMsg: string | null = null;

    imageFile: File | null = null;
    imagePreviewUrl: string | null = null;
    imageErrorMsg: string | null = null;

    resetErrors() {
        this.isTitleErr = false;
        this.isSaveErr = false;
        this.isCategoryErr = false;

        this.titleErrorMsg = null;
        this.descriptionErrorMsg = null;
        this.categoryErrorMsg = null;
        this.imageErrorMsg = null;

    }

    shallowClone(): State {
        return Object.assign(new State(), this);
    }
}

function RecipeCreate() {
    const [state, setState] = useState(new State());
    const navigate = useNavigate();

    useEffect(() => {
        // Load categories (new backend: /api/categories)
        backend
            .get("/categories")
            .then((response) => {
                const categoriesFromApi = response.data.map((cat: any) => ({
                    label: cat.name,
                    value: cat.id,
                }));

                setState((s) => {
                    s.categoriesList = categoriesFromApi;
                    return s.shallowClone();
                });
            })
            .catch((err) => {
                console.error("Failed to load categories:", err);
                setState((s) => {
                    s.isSaveErr = true; // reuse generic banner
                    return s.shallowClone();
                });
            });
    }, []);

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

    const onSave = () => {
        // 1) Client-side validation
        updateState((s) => {
            s.resetErrors();

            if (s.title.trim() === "") s.isTitleErr = true;
            if (s.categoryId === null) s.isCategoryErr = true;
        });

        const hasClientErrors =
            state.title.trim() === "" || state.categoryId === null;

        if (hasClientErrors) return;

        // 2) Build payload that matches new backend CreateRecipeDto:
        // { title, description, categoryId }
        const recipe = {
            title: state.title.trim(),
            description: state.description.trim() === "" ? null : state.description.trim(),
            categoryId: state.categoryId,
        };

        console.log("Recipe payload:", recipe);

        // 3) Send to backend (new backend: /api/recipes)
        backend
            .post("/recipes", recipe)
            .then(async (res) => {
                const created = res.data as { id: number };

                // if user picked an image, upload it
                if (state.imageFile) {
                    const fd = new FormData();
                    fd.append("file", state.imageFile);

                    await backend.post(`/recipes/${created.id}/image`, fd, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                }

                notifySuccess("Recipe created successfully!");
                navigate(appState.isAdmin ? "/admin/recipes" : "/user/recipes");
            })
            .catch((err: any) => {
                console.error("Create failed:", err);

                // handle image upload errors separately if you want:
                // if the create succeeded but upload failed, the error will be here only if you throw it.
                const errors = err?.response?.data?.errors;

                if (errors) {
                    updateState((s) => {
                        s.titleErrorMsg = null;
                        s.descriptionErrorMsg = null;
                        s.categoryErrorMsg = null;

                        if (errors.Title?.[0]) s.titleErrorMsg = errors.Title[0];
                        if (errors.Description?.[0]) s.descriptionErrorMsg = errors.Description[0];
                        if (errors.CategoryId?.[0]) s.categoryErrorMsg = errors.CategoryId[0];
                    });
                } else {
                    updateState((s) => {
                        s.isSaveErr = true;
                    });
                }
            });
    };

    return (
        <div className="d-flex flex-column h-100 overflow-auto p-4">
            <h2 className="mb-4 text-primary">Create New Recipe</h2>

            <div className="d-flex justify-content-center">
                <div className="d-flex flex-column align-items-start" style={{ width: "80ch" }}>
                    {state.isSaveErr && (
                        <div className="alert alert-warning w-100">
                            Saving failed. Please try again later.
                        </div>
                    )}

                    {/* Title */}
                    <label htmlFor="title" className="form-label mt-2">
                        Title:
                    </label>
                    <InputText
                        id="title"
                        className={
                            "form-control " +
                            ((state.isTitleErr || state.titleErrorMsg) ? "is-invalid" : "")
                        }
                        value={state.title}
                        onChange={(e) => update(() => (state.title = e.target.value))}
                    />
                    {(state.isTitleErr || state.titleErrorMsg) && (
                        <div className="invalid-feedback d-block">
                            {state.titleErrorMsg ?? "Title cannot be empty."}
                        </div>
                    )}

                    {/* Description */}
                    <label htmlFor="description" className="form-label mt-3">
                        Description:
                    </label>
                    <InputTextarea
                        id="description"
                        rows={4}
                        className={"form-control " + (state.descriptionErrorMsg ? "is-invalid" : "")}
                        value={state.description}
                        onChange={(e) => update(() => (state.description = e.target.value))}
                    />
                    {state.descriptionErrorMsg && (
                        <div className="invalid-feedback d-block">{state.descriptionErrorMsg}</div>
                    )}

                    {/* Category (single-select) */}
                    <label htmlFor="category" className="form-label mt-3">
                        Category:
                    </label>

                    {state.categoriesList.length === 0 ? (
                        <p>Loading categories...</p>
                    ) : (
                        <>
                            <Dropdown
                                id="category"
                                value={state.categoryId}
                                options={state.categoriesList}
                                onChange={(e) => update(() => (state.categoryId = e.value as number))}
                                optionLabel="label"
                                placeholder="Select a category"
                                filter
                                filterPlaceholder="Search categories..."
                                className={
                                    "w-100 " +
                                    ((state.isCategoryErr || state.categoryErrorMsg) ? "is-invalid" : "")
                                }
                            />

                            {(state.isCategoryErr || state.categoryErrorMsg) && (
                                <div className="invalid-feedback d-block">
                                    {state.categoryErrorMsg ?? "Please select a category."}
                                </div>
                            )}
                        </>
                    )}

                    {/* Image upload */}
                    <label htmlFor="image" className="form-label mt-3">
                        Image (optional):
                    </label>

                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className={"form-control " + (state.imageErrorMsg ? "is-invalid" : "")}
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;

                            update(() => {
                                state.imageFile = file;

                                // preview
                                if (state.imagePreviewUrl) URL.revokeObjectURL(state.imagePreviewUrl);
                                state.imagePreviewUrl = file ? URL.createObjectURL(file) : null;
                            });
                        }}
                    />

                    {state.imageErrorMsg && (
                        <div className="invalid-feedback d-block">{state.imageErrorMsg}</div>
                    )}

                    {state.imagePreviewUrl && (
                        <img
                            src={state.imagePreviewUrl}
                            alt="preview"
                            style={{ width: "220px", height: "140px", objectFit: "cover" }}
                            className="mt-2 rounded"
                        />
                    )}


                    {/* Save & Cancel buttons */}
                    <div className="d-flex justify-content-center align-items-center w-100 mt-4">
                        <button type="button" className="btn btn-primary mx-2" onClick={onSave}>
                            <i className="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary mx-2"
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeCreate;
