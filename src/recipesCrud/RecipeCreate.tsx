import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Rating } from "primereact/rating";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { MultiSelect } from "primereact/multiselect";
import { useEffect } from "react";

import backend from "../app/backend";
import config from "../app/config";
import { notifySuccess } from "../app/notify";

/**
 * Component state class.
 */
class State {
    title: string = "";
    description: string = "";
    status: string = "Pending";
    average_Rating: number = 0;
    imageBase64: string;
    categoryIds: number[] = [];

    categoriesList : {label: string; value: number }[] = [];

    isTitleErr: boolean = false;
    isSaveErr: boolean = false;

    resetErrors() {
        this.isTitleErr = false;
        this.isSaveErr = false;
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

    useEffect(() => {
        // Fetch categories from the backend
        backend
            .get(config.backendUrl + "/categories")
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
            .catch((error) => {
                console.error("Failed to load categories:", error);
            });
    }, []); // runs once when component mounts


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

    const onImageUpload = (e: any) => {
        const file = e.files[0];
        const reader = new FileReader();
        reader.onloadend = () => update(() => (state.imageBase64 = reader.result as string));
        reader.readAsDataURL(file);
    };

    const onSave = () => {
        update(() => {
            state.resetErrors();

            if (state.title.trim() === "") state.isTitleErr = true;
            if (state.isTitleErr) return;

            const recipe = {
                title: state.title,
                description: state.description,
                status: state.status,
                average_Rating: state.average_Rating,
                imageBase64: state.imageBase64,
                categoryIds: state.categoryIds,
            };

            backend
                .post(config.backendUrl + "/recipes", recipe)
                .then(() => {
                    notifySuccess("Recipe created successfully!");
                    navigate("/recipes");
                })
                .catch(() => {
                    updateState((s) => (s.isSaveErr = true));
                });
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
                        className={"form-control " + (state.isTitleErr ? "is-invalid" : "")}
                        value={state.title}
                        onChange={(e) => update(() => (state.title = e.target.value))}
                    />
                    {state.isTitleErr && (
                        <div className="invalid-feedback">Title cannot be empty.</div>
                    )}

                    {/* Description */}
                    <label htmlFor="description" className="form-label mt-3">
                        Description:
                    </label>
                    <InputTextarea
                        id="description"
                        rows={4}
                        className="form-control"
                        value={state.description}
                        onChange={(e) => update(() => (state.description = e.target.value))}
                    />

                    {/* Rating */}
                    <label htmlFor="rating" className="form-label mt-3">
                        Rating:
                    </label>
                    <Rating
                        id="rating"
                        stars={5}
                        value={state.average_Rating}
                        onChange={(e) => update(() => (state.average_Rating = e.value))}
                    />

                    {/* Status dropdown */}
                    <label htmlFor="status" className="form-label mt-3">
                        Status:
                    </label>
                    <InputText id="status" className="form-control" value={state.status} disabled />


                    {/* Categories (multi-select) */}
                    <label htmlFor="categories" className="form-label mt-3">
                        Categories:
                    </label>

                    {state.categoriesList.length === 0 ? (
                        <p>Loading categories...</p>
                    ) : (
                        <MultiSelect
                            id="categories"
                            value={state.categoryIds}
                            options={state.categoriesList}
                            onChange={(e) => update(() => (state.categoryIds = e.value))}
                            optionLabel="label"
                            placeholder="Select one or more categories"
                            display="chip"
                            filter
                            filterPlaceholder="Search categories..."
                            className="w-100"
                        />
                    )}

                    {/* Image upload */}
                    <label htmlFor="image" className="form-label mt-3">
                        Upload Image:
                    </label>
                    <FileUpload
                        name="image"
                        accept="image/*"
                        maxFileSize={15000000}
                        customUpload
                        uploadHandler={onImageUpload}
                        chooseLabel="Select Image"
                        mode="basic"
                    />

                    {/* Save & Cancel buttons */}
                    <div className="d-flex justify-content-center align-items-center w-100 mt-4">
                        <button type="button" className="btn btn-primary mx-2" onClick={() => onSave()}>
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
