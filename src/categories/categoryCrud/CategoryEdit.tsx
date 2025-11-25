import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import config from "../../app/config";
import backend from "../../app/backend";
import { notifySuccess } from "../../app/notify";

interface CategoryForCU {
    id: number;
    name: string;
    description?: string | null;
}

/**
 * Component state.
 */
class State {
    isInitialized: boolean = false;
    isLoading: boolean = false;
    isLoaded: boolean = false;

    id: number = -1;
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
 * Editing a category.
 */
function CategoryEdit() {
    const [state, setState] = useState(new State());

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

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

    // initialize (same pattern as EntityEdit)
    if (!state.isInitialized) {
        // mark as loading
        update(() => {
            state.isInitialized = true;
            state.isLoading = true;
            state.isLoaded = false;
        });

        // load category from backend
        backend
            .get<CategoryForCU>(config.backendUrl + `/categories/${id}`)
            .then((resp) => {
                const data = resp.data;
                updateState((s) => {
                    s.isLoading = false;
                    s.isLoaded = true;

                    s.id = data.id;
                    s.name = data.name;
                    s.description = data.description ?? "";
                });
            })
            .catch((err) => {
                console.error("Failed to load category:", err);
                // mark as "not loaded" – template uses this to show backend failure
                updateState((s) => {
                    s.isLoading = false;
                    s.isLoaded = false;
                });
            });
    }

    const onSave = () => {
        update(() => {
            // reset errors
            state.resetErrors();

            // basic client-side validation
            if (state.name.trim() === "") {
                state.isNameErr = true;
                state.nameErrorMsg = "Name cannot be empty.";
            }

            if (state.isNameErr) return;

            const payload = {
                name: state.name.trim(),
                // send null if empty so backend doesn't enforce 5 chars on ""
                description:
                    state.description.trim() === ""
                        ? null
                        : state.description.trim(),
            };

            backend
                .put(config.backendUrl + `/categories/${state.id}`, payload)
                .then(() => {
                    notifySuccess("Category updated.");
                    // go back to list and trigger refresh (same pattern as template)
                    navigate("./../../", { state: "refresh" });
                })
                .catch((err) => {
                    const errors = err?.response?.data?.errors;

                    if (errors) {
                        // map backend ModelState to fields
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

    // render
    let html =
        <>
            <div className="d-flex flex-column h-100 overflow-auto">
                <div className="mb-1">Editing category</div>

                {state.isLoading && (
                    <div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center">
                        <span className="alert alert-info mx-2">
                            Loading data...
                        </span>
                    </div>
                )}

                {state.isInitialized && !state.isLoading && !state.isLoaded && (
                    <div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center">
                        <span className="alert alert-warning mx-2">
                            Backend failure, please try again...
                        </span>
                    </div>
                )}

                {state.isLoaded && (
                    <>
                        <div className="d-flex justify-content-center">
                            <div
                                className="d-flex flex-column align-items-start"
                                style={{ width: "60ch" }}
                            >
                                {state.isSaveErr && (
                                    <div className="alert alert-warning w-100">
                                        Saving failed due to backend failure.
                                        Please, wait a little and retry.
                                    </div>
                                )}

                                {/* ID (read-only) */}
                                <label htmlFor="id" className="form-label">
                                    ID:
                                </label>
                                <span id="id">{state.id}</span>

                                {/* Name */}
                                <label htmlFor="name" className="form-label mt-3">
                                    Name:
                                </label>
                                <InputText
                                    id="name"
                                    className={
                                        "form-control " +
                                        (state.isNameErr ? "is-invalid" : "")
                                    }
                                    value={state.name}
                                    onChange={(e) =>
                                        update(() => (state.name = e.target.value))
                                    }
                                />
                                {state.isNameErr && (
                                    <div className="invalid-feedback">
                                        {state.nameErrorMsg ||
                                            "Name is required."}
                                    </div>
                                )}

                                {/* Description */}
                                <label
                                    htmlFor="description"
                                    className="form-label mt-3"
                                >
                                    Description (optional):
                                </label>
                                <InputTextarea
                                    id="description"
                                    rows={3}
                                    className={
                                        "form-control " +
                                        (state.descriptionErrorMsg
                                            ? "is-invalid"
                                            : "")
                                    }
                                    value={state.description}
                                    onChange={(e) =>
                                        update(
                                            () =>
                                                (state.description =
                                                    e.target.value)
                                        )
                                    }
                                />
                                {state.descriptionErrorMsg && (
                                    <div className="invalid-feedback d-block">
                                        {state.descriptionErrorMsg}
                                    </div>
                                )}
                                <small className="text-muted">
                                    If provided, description must be between 5
                                    and 100 characters (backend rule).
                                </small>
                            </div>
                        </div>

                        <div className="d-flex justify-content-center align-items-center w-100 mt-3">
                            <button
                                type="button"
                                className="btn btn-primary mx-1"
                                onClick={() => onSave()}
                            >
                                <i className="fa-solid fa-floppy-disk"></i> Save
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary mx-1"
                                onClick={() => navigate("./../../")}
                            >
                                <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>;

    return html;
}

export default CategoryEdit;
