import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";

import backend from "../app/backend";
import { notifySuccess, notifyFailure } from "../app/notify";

type Props = {
    visible: boolean;
    onHide: () => void;
    onRegistered?: () => void; // optional hook (e.g., reopen login)
};

class State {
    Email: string = "";
    UserName: string = "";
    Password: string = "";

    isEmailErr: boolean = false;
    isUsernameErr: boolean = false;
    isPasswordErr: boolean = false;

    isRegisterErr: boolean = false;
    registerErrMsg: string = "";

    resetErrors() {
        this.isEmailErr = false;
        this.isUsernameErr = false;
        this.isPasswordErr = false;
        this.isRegisterErr = false;
        this.registerErrMsg = "";
    }

    shallowClone(): State {
        return Object.assign(new State(), this);
    }
}

function isValidEmail(email: string) {
    // simple check; your backend will still validate properly
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function RegisterDialog({ visible, onHide, onRegistered }: Props) {
    const [state, setState] = useState(new State());

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

    const onRegister = () => {
        update(() => {
            state.resetErrors();

            // validate
            if (!isValidEmail(state.Email)) state.isEmailErr = true;
            if (state.UserName.trim() === "") state.isUsernameErr = true;
            if (state.Password === "") state.isPasswordErr = true;

            const hasErrs = state.isEmailErr || state.isUsernameErr || state.isPasswordErr;
            if (hasErrs) return;

            backend
                .post("/accounts", {
                    email: state.Email.trim(),
                    userName: state.UserName.trim(),
                    password: state.Password,
                })
                .then(() => {
                    notifySuccess("Registration successful.");
                    // close + optional callback
                    onHide();
                    onRegistered?.();
                    // (optional) clear fields
                    updateState((s) => {
                        s.Email = "";
                        s.UserName = "";
                        s.Password = "";
                        s.resetErrors();
                    });
                })
                .catch((err) => {
                    const status = err?.response?.status;
                    const msg =
                        (typeof err?.response?.data === "string" && err.response.data) ||
                        (status === 422 ? "Registration failed (validation error)." : "Registration failed.");

                    updateState((s) => {
                        s.isRegisterErr = true;
                        s.registerErrMsg = msg;
                    });

                    // optional toast too
                    notifyFailure(msg);
                });
        });
    };

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={<span className="me-2">Create account</span>}
            style={{ width: "55ch" }}
        >
            {state.isRegisterErr && (
                <div className="alert alert-warning">{state.registerErrMsg || "Registration failed."}</div>
            )}

            <div className="mb-3">
                <label htmlFor="reg-email" className="form-label">
                    Email:
                </label>
                <InputText
                    id="reg-email"
                    className={"form-control " + (state.isEmailErr ? "is-invalid" : "")}
                    placeholder="Enter your email"
                    autoFocus
                    value={state.Email}
                    onChange={(e) => update(() => (state.Email = e.target.value))}
                />
                {state.isEmailErr && <div className="invalid-feedback">Please enter a valid email.</div>}
            </div>

            <div className="mb-3">
                <label htmlFor="reg-username" className="form-label">
                    Username:
                </label>
                <InputText
                    id="reg-username"
                    className={"form-control " + (state.isUsernameErr ? "is-invalid" : "")}
                    placeholder="Choose a username"
                    value={state.UserName}
                    onChange={(e) => update(() => (state.UserName = e.target.value))}
                />
                {state.isUsernameErr && (
                    <div className="invalid-feedback">Username must be non empty and non whitespace.</div>
                )}
            </div>

            <div className="mb-3">
                <label htmlFor="reg-password" className="form-label">
                    Password
                </label>
                <Password
                    id="reg-password"
                    className={"form-control " + (state.isPasswordErr ? "is-invalid" : "")}
                    placeholder="Create a password"
                    toggleMask
                    feedback={true}
                    value={state.Password}
                    onChange={(e) => update(() => (state.Password = e.target.value))}
                />
                {state.isPasswordErr && <div className="invalid-feedback">Password must be non empty.</div>}
            </div>

            <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-primary me-2" onClick={onRegister}>
                    Register
                </button>
                <button type="button" className="btn btn-primary" onClick={onHide}>
                    Cancel
                </button>
            </div>
        </Dialog>
    );
}
