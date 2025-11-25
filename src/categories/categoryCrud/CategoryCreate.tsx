import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import backend from "../../app/backend";
import config from "../../app/config";
import { notifySuccess } from "../../app/notify";

/**
 * Component state class.
 */
class State {
    name: string = "";
    description: string = "";

    isNameErr: boolean = false;
    isSaveErr: boolean = false;

    // backend validation messages
    nameErrorMsg: string | null = null;
    descriptionErrorMsg: string | null = null;

    resetErrors() {
        this.isNameErr = false;
        this.isSaveErr = false;
        this.nameErrorMsg = null;
        this.descriptionErrorMsg = null;
    }

    shallowClone(): State {
        return Object.assign(new State(), this);
    }
}

/**
 * Component for creating new categories.
 */
function CategoryCreate() {
    const [state, setState] = useState(new State());
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

    const onSave = () => {
        update(() => {
            state.resetErrors();

            // Simple client-side check for empty name
            if (state.name.trim() === "") {
                state.isNameErr = true;
                state.nameErrorMsg = "Name cannot be empty.";
            }

            if (state.isNameErr) return;

            const category = {
                name: state.name.trim(),
                // if empty string, send null so backend doesn't try to enforce 5 chars
                description: state.description.trim() === "" ? null : state.description.trim(),
            };

            backend
                .post(config.backendUrl + "/categories", category)
                .then(() => {
                    notifySuccess("Category created successfully!");
                    navigate("/admin/categories");
                })
                .catch((err) => {
                    const errors = err?.response?.data?.errors;
                    if (errors) {
                        updateState((s) => {
                            if (errors.Name?.[0]) {
                                s.isNameErr = true;
                                s.nameErrorMsg = errors.Name[0];
                            }
                            if (errors.Description?.[0]) {
                                s.descriptionErrorMsg = errors.Description[0];
                            }
                        });
                    } else {
                        updateState((s) => (s.isSaveErr = true));
                    }
                });
        });
    };

    return (
        <div className="d-flex flex-column h-100 overflow-auto p-4">
            <h2 className="mb-4 text-primary">Create New Category</h2>

            <div className="d-flex justify-content-center">
                <div className="d-flex flex-column align-items-start" style={{ width: "60ch" }}>
                    {state.isSaveErr && (
                        <div className="alert alert-warning w-100">
                            Saving failed. Please try again later.
                        </div>
                    )}

                    {/* Name */}
                    <label htmlFor="name" className="form-label mt-2">
                        Name:
                    </label>
                    <InputText
                        id="name"
                        className={"form-control " + (state.isNameErr ? "is-invalid" : "")}
                        value={state.name}
                        onChange={(e) => update(() => (state.name = e.target.value))}
                    />
                    {state.isNameErr && (
                        <div className="invalid-feedback">
                            {state.nameErrorMsg || "Name is required."}
                        </div>
                    )}

                    {/* Description */}
                    <label htmlFor="description" className="form-label mt-3">
                        Description (optional):
                    </label>
                    <InputTextarea
                        id="description"
                        rows={3}
                        className={
                            "form-control " +
                            (state.descriptionErrorMsg ? "is-invalid" : "")
                        }
                        value={state.description}
                        onChange={(e) => update(() => (state.description = e.target.value))}
                    />
                    {state.descriptionErrorMsg && (
                        <div className="invalid-feedback d-block">
                            {state.descriptionErrorMsg}
                        </div>
                    )}
                    <small className="text-muted">
                        If provided, description must be between 5 and 100 characters (backend
                        rule).
                    </small>

                    {/* Buttons */}
                    <div className="d-flex justify-content-center align-items-center w-100 mt-4">
                        <button
                            type="button"
                            className="btn btn-primary mx-2"
                            onClick={() => onSave()}
                        >
                            <i className="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary mx-2"
                            onClick={() => navigate("/admin/categories")}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryCreate;
