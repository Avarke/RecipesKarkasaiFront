import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import backend from "../../app/backend";
import config from "../../app/config";
import { notifySuccess } from "../../app/notify";

interface ReviewVm {
    id: number;
    rating: number;
    comment: string | null;
    recipeId: number;
    recipeTitle: string;
}

/**
 * Component state.
 */
class State {
    isInitialized: boolean = false;
    isLoading: boolean = false;
    isLoaded: boolean = false;

    id: number = -1;
    rating: number = 0;
    comment: string = "";
    recipeId: number = -1;
    recipeTitle: string = "";

    isSaveErr: boolean = false;

    // backend validation messages
    ratingErrorMsg: string | null = null;
    commentErrorMsg: string | null = null;

    resetErrors() {
        this.isSaveErr = false;
        this.ratingErrorMsg = null;
        this.commentErrorMsg = null;
    }

    shallowClone(): State {
        return Object.assign(new State(), this);
    }
}

function AdminReviewEdit() {
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

    // initialize (similar pattern to RecipeEdit)
    if (!state.isInitialized) {
        update(() => {
            state.isInitialized = true;
            state.isLoading = true;
            state.isLoaded = false;
        });

        backend
            .get<ReviewVm>(`${config.backendUrl}/reviews/${id}`)
            .then((res) => {
                const review = res.data;

                updateState((s) => {
                    s.isLoading = false;
                    s.isLoaded = true;

                    s.id = review.id;
                    s.rating = review.rating;
                    s.comment = review.comment ?? "";
                    s.recipeId = review.recipeId;
                    s.recipeTitle = review.recipeTitle;
                });
            })
            .catch((err) => {
                console.error("Failed to load review:", err);
                updateState((s) => {
                    s.isLoading = false;
                    s.isLoaded = false;
                });
            });
    }

    const onSave = () => {
        update(() => {
            state.resetErrors();

            const payload = {
                rating: state.rating,
                comment:
                    state.comment.trim() === ""
                        ? null
                        : state.comment.trim(),
            };

            backend
                .put(`${config.backendUrl}/reviews/${state.id}`, payload)
                .then(() => {
                    notifySuccess("Review updated.");
                    navigate("/admin/reviews", { state: "refresh" });
                })
                .catch((err: any) => {
                    console.error("Update review failed:", err);
                    const errors = err?.response?.data?.errors;

                    if (errors) {
                        updateState((s) => {
                            if (errors.Rating?.[0]) {
                                s.ratingErrorMsg = errors.Rating[0];
                            }
                            if (errors.Comment?.[0]) {
                                s.commentErrorMsg = errors.Comment[0];
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

    // render states
    if (state.isLoading) {
        return <p className="text-center mt-5">Loading review...</p>;
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
        <div className="container py-5" style={{ maxWidth: "600px" }}>
            <h2>
                Edit Review #{state.id} – {state.recipeTitle}
            </h2>

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
                {/* Recipe (read-only) */}
                <div className="mb-3">
                    <label className="form-label">Recipe</label>
                    <input
                        type="text"
                        className="form-control"
                        value={`${state.recipeTitle} (#${state.recipeId})`}
                        disabled
                    />
                </div>

                {/* Rating */}
                <div className="mb-3">
                    <label className="form-label">Rating (0–5)</label>
                    <input
                        type="number"
                        min={0}
                        max={5}
                        className={
                            "form-control " +
                            (state.ratingErrorMsg ? "is-invalid" : "")
                        }
                        value={state.rating}
                        onChange={(e) =>
                            update(
                                () =>
                                    (state.rating = Number(e.target.value))
                            )
                        }
                    />
                    {state.ratingErrorMsg && (
                        <div className="invalid-feedback">
                            {state.ratingErrorMsg}
                        </div>
                    )}
                </div>

                {/* Comment */}
                <div className="mb-3">
                    <label className="form-label">Comment (optional)</label>
                    <textarea
                        className={
                            "form-control " +
                            (state.commentErrorMsg ? "is-invalid" : "")
                        }
                        rows={3}
                        value={state.comment}
                        onChange={(e) =>
                            update(
                                () => (state.comment = e.target.value)
                            )
                        }
                    />
                    {state.commentErrorMsg && (
                        <div className="invalid-feedback">
                            {state.commentErrorMsg}
                        </div>
                    )}
                </div>

                <button className="btn btn-primary" type="submit">
                    Save Changes
                </button>
                <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => navigate("/admin/reviews")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default AdminReviewEdit;
