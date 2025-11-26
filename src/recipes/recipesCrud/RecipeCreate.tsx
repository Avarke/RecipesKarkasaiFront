import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";

import backend from "../../app/backend";
import config from "../../app/config";
import { notifySuccess } from "../../app/notify";

/**
 * Component state class.
 */

type IngredientFormRow = {
    ingredientId: number | null;
    ingredientName: string;
    quantity: string;
    unit: string;
    ingredientNameError?: string | null; // NEW
};


class State {
    title: string = "";
    description: string = "";
    status: string = "Pending";
    average_Rating: number = 0;
    imageBase64: string = "";
    categoryIds: number[] = [];

    categoriesList: { label: string; value: number }[] = [];

    // NEW → ingredients being edited
    // ingredients: {
    //     ingredientId: number | null;
    //     ingredientName: string;
    //     quantity: string;
    //     unit: string;
    //
    // }[] = [];

    ingredients: IngredientFormRow[] = [];

    ingredientOptions: { label: string; value: number }[] = []; // dropdown list

    // client-side errors
    isTitleErr = false;
    isSaveErr = false;
    isCategoryErr = false;

    titleErrorMsg: string | null = null;
    descriptionErrorMsg: string | null = null;
    categoryIdsErrorMsg: string | null = null;

    resetErrors() {
        this.isTitleErr = false;
        this.isSaveErr = false;
        this.isCategoryErr = false;

        this.titleErrorMsg = null;
        this.descriptionErrorMsg = null;
        this.categoryIdsErrorMsg = null;
    }

    shallowClone(): State {
        return Object.assign(new State(), this);
    }
}

/**
 * Component for creating new recipes.
 */
function RecipeCreate() {
    const [state, setState] = useState(new State());
    const navigate = useNavigate();

    useEffect(() => {
        // Load categories
        backend.get(config.backendUrl + "/categories")
            .then(response => {
                const categoriesFromApi = response.data.map((cat: any) => ({
                    label: cat.name,
                    value: cat.id,
                }));
                setState(s => {
                    s.categoriesList = categoriesFromApi;
                    return s.shallowClone();
                });
            });

        // Load ingredient list for dropdown
        backend.get(config.backendUrl + "/ingredients")
            .then(response => {
                const ing = response.data.map((i: any) => ({
                    label: i.name,
                    value: i.id
                }));
                setState(s => {
                    s.ingredientOptions = ing;
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
        // 1) Run client-side validation and set error flags/messages
        updateState((s) => {
            s.resetErrors();

            if (s.title.trim() === "") {
                s.isTitleErr = true;
            }
            if (s.categoryIds.length === 0) {
                s.isCategoryErr = true;
            }
        });

        // 2) If client-side errors exist, abort
        const hasClientErrors =
            state.title.trim() === "" || state.categoryIds.length === 0;
        if (hasClientErrors) return;

        // 3) Build payload (nulls where appropriate to match backend DTOs)
        const recipe = {
            title: state.title.trim(),
            description:
                state.description.trim() === ""
                    ? null
                    : state.description.trim(),
            status: state.status,
            imageBase64:
                state.imageBase64 && state.imageBase64.trim() !== ""
                    ? state.imageBase64
                    : null,
            categoryIds: state.categoryIds,

            ingredients: state.ingredients.map((i) => ({
                ingredientId: i.ingredientId,                      // can be null or number
                ingredientName: i.ingredientName.trim(),          // string
                quantity: i.quantity.trim() || null,              // string or null
                unit: i.unit.trim() || null,                      // string or null
            })),
        };

        console.log("Recipe payload:", recipe);

        // 4) Send to backend
        backend
            .post(config.backendUrl + "/recipes", recipe)
            .then(() => {
                notifySuccess("Recipe created successfully!");
                navigate("/recipes");
            })
            .catch((err: any) => {
                console.error("Create failed:", err);
                const errors = err?.response?.data?.errors;

                if (errors) {
                    updateState((s) => {
                        // clear previous errors
                        s.titleErrorMsg = null;
                        s.descriptionErrorMsg = null;
                        s.categoryIdsErrorMsg = null;

                        // clear ingredient errors
                        s.ingredients.forEach((ing) => {
                            ing.ingredientNameError = null;
                        });

                        if (errors.Title?.[0]) {
                            s.titleErrorMsg = errors.Title[0];
                        }
                        if (errors.Description?.[0]) {
                            s.descriptionErrorMsg = errors.Description[0];
                        }
                        if (errors.CategoryIds?.[0]) {
                            s.categoryIdsErrorMsg = errors.CategoryIds[0];
                        }

                        // handle ingredient name errors: Ingredients[0].IngredientName, etc.
                        Object.entries(errors).forEach(([key, value]) => {
                            const messages = value as string[];

                            const match = key.match(/^Ingredients\[(\d+)\]\.IngredientName$/);
                            if (match) {
                                const index = Number(match[1]);
                                if (!Number.isNaN(index) && s.ingredients[index]) {
                                    s.ingredients[index].ingredientNameError = messages[0];
                                }
                            }
                        });
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
                <div
                    className="d-flex flex-column align-items-start"
                    style={{ width: "80ch" }}
                >
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
                            ((state.isTitleErr || state.titleErrorMsg)
                                ? "is-invalid"
                                : "")
                        }
                        value={state.title}
                        onChange={(e) =>
                            update(() => (state.title = e.target.value))
                        }
                    />
                    {(state.isTitleErr || state.titleErrorMsg) && (
                        <div className="invalid-feedback d-block">
                            {state.titleErrorMsg ?? "Title cannot be empty."}
                        </div>
                    )}

                    {/* Description */}
                    <label
                        htmlFor="description"
                        className="form-label mt-3"
                    >
                        Description:
                    </label>
                    <InputTextarea
                        id="description"
                        rows={4}
                        className={
                            "form-control " +
                            (state.descriptionErrorMsg ? "is-invalid" : "")
                        }
                        value={state.description}
                        onChange={(e) =>
                            update(
                                () => (state.description = e.target.value)
                            )
                        }
                    />
                    {state.descriptionErrorMsg && (
                        <div className="invalid-feedback d-block">
                            {state.descriptionErrorMsg}
                        </div>
                    )}

                    {/* Status dropdown (read-only for now) */}
                    <label htmlFor="status" className="form-label mt-3">
                        Status:
                    </label>
                    <InputText
                        id="status"
                        className="form-control"
                        value={state.status}
                        disabled
                    />

                    {/* Categories (multi-select) */}
                    <label
                        htmlFor="categories"
                        className="form-label mt-3"
                    >
                        Categories:
                    </label>

                    {state.categoriesList.length === 0 ? (
                        <p>Loading categories...</p>
                    ) : (
                        <>
                            <MultiSelect
                                id="categories"
                                value={state.categoryIds}
                                options={state.categoriesList}
                                onChange={(e) =>
                                    update(
                                        () =>
                                            (state.categoryIds =
                                                e.value as number[])
                                    )
                                }
                                optionLabel="label"
                                placeholder="Select one or more categories"
                                display="chip"
                                filter
                                filterPlaceholder="Search categories..."
                                className={
                                    "w-100 " +
                                    ((state.isCategoryErr ||
                                        state.categoryIdsErrorMsg)
                                        ? "is-invalid"
                                        : "")
                                }
                            />
                            {(state.isCategoryErr ||
                                state.categoryIdsErrorMsg) && (
                                <div className="invalid-feedback d-block">
                                    {state.categoryIdsErrorMsg ??
                                        "Please select at least one category."}
                                </div>
                            )}
                        </>
                    )}

                    {/* Image upload */}
                    <div className="mb-3 mt-3 w-100">
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

                    {/* INGREDIENTS */}
                    <div className="mt-4 w-100">
                        <h5>Ingredients</h5>

                        {state.ingredients.map((ing, idx) => (
                            <div key={idx} className="border rounded p-3 mb-3">

                                {/* Ingredient select OR text */}
                                <label className="form-label">Ingredient</label>
                                <select
                                    className="form-select mb-2"
                                    value={ing.ingredientId ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        update(() => {
                                            if (value === "") {
                                                ing.ingredientId = null;
                                                ing.ingredientName = "";
                                            } else {
                                                ing.ingredientId = Number(value);
                                                const text = state.ingredientOptions.find(
                                                    (o) => o.value === Number(value)
                                                )?.label ?? "";
                                                ing.ingredientName = text;
                                            }
                                        });
                                    }}
                                >
                                    <option value="">-- Enter manually --</option>
                                    {state.ingredientOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>

                                {/* If user wants to type new ingredient */}
                                {ing.ingredientId === null && (
                                    <>
                                        <InputText
                                            className={
                                                "form-control mb-2 " +
                                                (ing.ingredientNameError ? "is-invalid" : "")
                                            }
                                            placeholder="Ingredient name..."
                                            value={ing.ingredientName}
                                            onChange={(e) =>
                                                update(() => {
                                                    ing.ingredientName = e.target.value;
                                                    // clear client-side when user starts typing again
                                                    ing.ingredientNameError = null;
                                                })
                                            }
                                        />
                                        {ing.ingredientNameError && (
                                            <div className="invalid-feedback d-block">
                                                {ing.ingredientNameError}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Quantity */}
                                <label className="form-label">Quantity</label>
                                <InputText
                                    className="form-control mb-2"
                                    placeholder="e.g. 1"
                                    value={ing.quantity}
                                    onChange={(e) =>
                                        update(() => (ing.quantity = e.target.value))
                                    }
                                />

                                {/* Unit */}
                                <label className="form-label">Unit</label>
                                <InputText
                                    className="form-control mb-2"
                                    placeholder="e.g. tbsp, cup, g"
                                    value={ing.unit}
                                    onChange={(e) =>
                                        update(() => (ing.unit = e.target.value))
                                    }
                                />

                                {/* Remove ingredient */}
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm mt-2"
                                    onClick={() =>
                                        update(() =>
                                            state.ingredients.splice(idx, 1)
                                        )
                                    }
                                >
                                    Remove Ingredient
                                </button>
                            </div>
                        ))}

                        {/* Add ingredient button */}
                        <button
                            type="button"
                            className="btn btn-secondary mt-2"
                            onClick={() =>
                                update(() =>
                                    state.ingredients.push({
                                        ingredientId: null,
                                        ingredientName: "",
                                        quantity: "",
                                        unit: "",
                                        ingredientNameError: null, // NEW
                                    })
                                )
                            }
                        >
                            + Add Ingredient
                        </button>
                    </div>



                    {/* Save & Cancel buttons */}
                    <div className="d-flex justify-content-center align-items-center w-100 mt-4">
                        <button
                            type="button"
                            className="btn btn-primary mx-2"
                            onClick={onSave}
                        >
                            <i className="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary mx-2"
                            onClick={() => navigate("/recipes")}
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
