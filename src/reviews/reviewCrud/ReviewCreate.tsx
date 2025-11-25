import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";

import backend from "../../app/backend";
import config from "../../app/config";
import { notifySuccess } from "../../app/notify";

interface RecipeOption {
    label: string;
    value: number;
    average_Rating: number;
}

/**
 * Component state class for creating a review.
 */
class State {
    rating: number = 0;
    comment: string = "";
    recipeId: number | null = null;

    recipesList: RecipeOption[] = [];

    // client-side errors
    isRatingErr: boolean = false;
    isRecipeErr: boolean = false;
    isSaveErr: boolean = false;

    // backend validation messages
    ratingErrorMsg: string | null = null;
    commentErrorMsg: string | null = null;
    recipeIdErrorMsg: string | null = null;

    resetErrors() {
        this.isRatingErr = false;
        this.isRecipeErr = false;
        this.isSaveErr = false;

        this.ratingErrorMsg = null;
        this.commentErrorMsg = null;
        this.recipeIdErrorMsg = null;
    }

    shallowClone(): State {
        return Object.assign(new State(), this);
    }
}

/**
 * Component for creating new reviews.
 */
function AdminReviewCreate() {
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

    // Load recipes for dropdown (top 100 by rating)
    useEffect(() => {
        backend
            .get(config.backendUrl + "/recipes")
            .then((res) => {
                const all = res.data as {
                    id: number;
                    title: string;
                    average_Rating: number;
                }[];

                const top100 = all
                    .sort((a, b) => b.average_Rating - a.average_Rating)
                    .slice(0, 100)
                    .map((r) => ({
                        label: `${r.title} (${r.average_Rating.toFixed(1)}/5)`,
                        value: r.id,
                        average_Rating: r.average_Rating,
                    }));

                setState((s) => {
                    s.recipesList = top100;
                    return s.shallowClone();
                });
            })
            .catch((err) => {
                console.error("Failed to load recipes for review create:", err);
            });
    }, []);

    const onSave = () => {
        // 1) client-side validation
        updateState((s) => {
            s.resetErrors();

            if (s.rating < 0 || s.rating > 5) {
                s.isRatingErr = true;
            }

            if (s.recipeId === null) {
                s.isRecipeErr = true;
            }
        });

        const hasClientErrors =
            state.rating < 0 ||
            state.rating > 5 ||
            state.recipeId === null;

        if (hasClientErrors) return;

        // 2) build payload for CreateReviewVm
        const payload = {
            rating: state.rating,
            comment:
                state.comment.trim() === ""
                    ? null
                    : state.comment.trim(),
            recipeId: state.recipeId!, // non-null after validation
        };

        // 3) send to backend
        backend
            .post(config.backendUrl + "/reviews", payload)
            .then(() => {
                notifySuccess("Review created successfully!");
                navigate("/admin/reviews", { state: "refresh" });
            })
            .catch((err: any) => {
                console.error("Create review failed:", err);
                const errors = err?.response?.data?.errors;

                if (errors) {
                    updateState((s) => {
                        if (errors.Rating?.[0]) {
                            s.ratingErrorMsg = errors.Rating[0];
                        }
                        if (errors.Comment?.[0]) {
                            s.commentErrorMsg = errors.Comment[0];
                        }
                        if (errors.RecipeId?.[0]) {
                            s.recipeIdErrorMsg = errors.RecipeId[0];
                        }
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
            <h2 className="mb-4 text-primary">Create New Review</h2>

            <div className="d-flex justify-content-center">
                <div
                    className="d-flex flex-column align-items-start"
                    style={{ width: "60ch" }}
                >
                    {state.isSaveErr && (
                        <div className="alert alert-warning w-100">
                            Saving failed. Please try again later.
                        </div>
                    )}

                    {/* Rating */}
                    <label htmlFor="rating" className="form-label mt-2">
                        Rating (0–5):
                    </label>
                    <input
                        id="rating"
                        type="number"
                        min={0}
                        max={5}
                        className={
                            "form-control " +
                            ((state.isRatingErr || state.ratingErrorMsg)
                                ? "is-invalid"
                                : "")
                        }
                        value={state.rating}
                        onChange={(e) =>
                            update(
                                () =>
                                    (state.rating = Number(e.target.value))
                            )
                        }
                    />
                    {(state.isRatingErr || state.ratingErrorMsg) && (
                        <div className="invalid-feedback d-block">
                            {state.ratingErrorMsg ??
                                "Rating must be between 0 and 5."}
                        </div>
                    )}

                    {/* Comment */}
                    <label htmlFor="comment" className="form-label mt-3">
                        Comment (optional):
                    </label>
                    <InputTextarea
                        id="comment"
                        rows={3}
                        className={
                            "form-control " +
                            (state.commentErrorMsg ? "is-invalid" : "")
                        }
                        value={state.comment}
                        onChange={(e) =>
                            update(
                                () => (state.comment = e.target.value)
                            )
                        }
                    />
                    {state.commentErrorMsg && (
                        <div className="invalid-feedback d-block">
                            {state.commentErrorMsg}
                        </div>
                    )}

                    {/* Recipe dropdown */}
                    <label htmlFor="recipe" className="form-label mt-3">
                        Recipe:
                    </label>
                    {state.recipesList.length === 0 ? (
                        <p>Loading recipes...</p>
                    ) : (
                        <>
                            <Dropdown
                                id="recipe"
                                value={state.recipeId}
                                options={state.recipesList}
                                optionLabel="label"
                                placeholder="Select recipe"
                                onChange={(e) =>
                                    update(
                                        () =>
                                            (state.recipeId =
                                                e.value as number)
                                    )
                                }
                                className={
                                    "w-100 " +
                                    ((state.isRecipeErr ||
                                        state.recipeIdErrorMsg)
                                        ? "is-invalid"
                                        : "")
                                }
                            />
                            {(state.isRecipeErr ||
                                state.recipeIdErrorMsg) && (
                                <div className="invalid-feedback d-block">
                                    {state.recipeIdErrorMsg ??
                                        "Please select a recipe."}
                                </div>
                            )}
                        </>
                    )}

                    {/* Buttons */}
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
                            onClick={() =>
                                navigate("/admin/reviews")
                            }
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminReviewCreate;
