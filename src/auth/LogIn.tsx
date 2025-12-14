import { useState } from 'react';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import {jwtDecode} from "jwt-decode";

import config from '../app/config';
import appState from '../app/appState';
import backend, {setAccessToken, setAuthenticatingBackend} from '../app/backend';
import '../navmenu/NavMenu.scss'
import RegisterDialog from "./Register";


import { LogInResponse } from './models';
import {notifyFailure, notifySuccess} from "../app/notify";
import {ZIndexUtils} from "primereact/utils";
import set = ZIndexUtils.set;

type TokenPayload = {
    role?: string | string[];  // ASP.NET might send one or many
    [key: string]: any;
};


/**
 * Component state.
 */
class State
{
	/** Indicates if log-in dialog is visible. */
	isDialogVisible : boolean = false;
    isRegisterVisible : boolean = false;


	/** Username, as entered. */
	UserName : string = "";

	/** Password, as entered. */
	Password : string = "";



	/** Indicates if username field validation failed. */
	isUsernameErr : boolean = false;

	/** Indicates if password field validation failed.  */
	isPasswordErr : boolean = false;

	/** Indicates if login has failed. */
	isLoginErr : boolean = false;

	/**
	 * Resets error flags to off.
	 */
	resetErrors() {
		this.isUsernameErr = false;
		this.isPasswordErr = false;
		this.isLoginErr = false;
	}

	/**
	 * Makes a shallow clone. Use this to return new state instance from state updates.
	 * @returns A shallow clone of this instance.
	 */
	shallowClone() : State {
		return Object.assign(new State(), this);
	}
}


/**
 * Log-in section in nav bar. React component.
 * @returns Component HTML.
 */
function LogIn() {
	//get state container and state updater
	const [state, setState] = useState(new State());

	/**
	 * This is used to update state without the need to return new state instance explicitly.
	 * It also allows updating state in one liners, i.e., 'update(state => state.xxx = yyy)'.
	 * @param updater State updater function.
	 */
	let update = (updater : () => void) => {
		updater();
		setState(state.shallowClone());
	}

	let updateState = (updater : (state : State) => void) => {
		setState(state => {
			updater(state);
			return state.shallowClone();
		})
	}

	/**
	 * Handles 'Log-in' command in dialog.
	 */
	let onLogIn = () => {
		update(() => {
			//reset previous errors
			state.resetErrors();

			//validate fields
			if( state.UserName.trim() === "" )
				state.isUsernameErr = true;

			if( state.Password === "" )
				state.isPasswordErr = true;

			//any fields invalid? abort
			let hasErrs =
				state.isUsernameErr ||
				state.isPasswordErr;

			if( hasErrs )
				return;

			//all fields valid, try loggin in
			//XXX: this is only secure over HTTPS, DO NOT SEND USER CREDENTIALS UNENCRYPTED in production code!
			backend.post<LogInResponse>(
				config.backendUrl + "/login",
				{
						userName : state.UserName,
						password : state.Password
				}
			)
			//login ok
			.then(resp => {
				let data = resp.data;

				//save user information and JWT for subsequent authenticaton in backend requests
                appState.authJwt   = data.accessToken;
                appState.userId    = data.userId;
                appState.userTitle = data.userName;

                setAccessToken(data.accessToken);
                const token = appState.authJwt;

                const decoded = jwtDecode<any>(token);
                const rawRole =
                    decoded.role ??
                    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                const roles =
                    Array.isArray(rawRole) ? rawRole :
                        typeof rawRole === "string" ? [rawRole] :
                            [];

                console.log("decoded token:", decoded);
                console.log("rawRole:", rawRole);

                appState.userRoles = roles;

				//replace backend connector with axios instance sending appropriate 'Authorization' header
				setAuthenticatingBackend(appState.authJwt);

				//indicate user is logged in
				appState.isLoggedIn.value = true;

                notifySuccess("Log in successful.");
			})
			//login failed or backend error, show error message
			.catch(err => {
				updateState(state => {
					state.isLoginErr = true;
				});
			});
		});
	}

	//render component html
	let html =
		<>
		<button
			type="button"
			className="btn btn-outline-primary"
			onClick={() => update(() => state.isDialogVisible = true)}
			>Log in</button>
		<Dialog
			visible={state.isDialogVisible}
			onHide={() => update(() => state.isDialogVisible = false)}
			header={<span className="me-2">Log in</span>}
			style={{width: "50ch"}}
			>
			{state.isLoginErr &&
				<div className="alert alert-warning">Log in has failed. Incorrect username, password or both.</div>
			}
			<div className="mb-3">
				<label
					htmlFor="username"
					className="form-label"
					>Username:</label>
				<InputText
					id="username"
					className={"form-control " + (state.isUsernameErr ? "is-invalid" : "") }
					placeholder="Enter your username"
					autoFocus
					value={state.UserName}
					onChange={(e) => update(() => state.UserName = e.target.value)}
					/>
				{state.isUsernameErr &&
					<div className="invalid-feedback">Username must be non empty and non whitespace.</div>
				}
			</div>
			<div className="mb-3">
				<label
					htmlFor="password"
					className="form-label"
					>Password</label>
				<Password
					id="password"
					className={"form-control " + (state.isPasswordErr ? "is-invalid" : "") }
					placeholder="Enter your password"
					toggleMask
					feedback={false}
					value={state.Password}
					onChange={(e) => update(() => state.Password = e.target.value)}
					/>
				{state.isPasswordErr &&
					<div className="invalid-feedback">Password must be non empty.</div>
				}
			</div>
			<div className="d-flex justify-content-end">
				<button
					type="button"
					className="btn btn-primary me-2"
					onClick={() => onLogIn()}
					>Log in</button>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => update(() => state.isDialogVisible = false)}
					>Cancel</button>
			</div>
            <div className="mt-2">
                <span className="text-muted">Don’t have an account? </span>
                <button
                    type="button"
                    className="btn btn-link p-0 align-baseline"
                    onClick={() =>
                        update(() => {
                            state.isDialogVisible = false;
                            state.isRegisterVisible = true;
                        })
                    }
                >
                    Register
                </button>
            </div>
		</Dialog>

            <RegisterDialog
                visible={state.isRegisterVisible}
                onHide={() => update(() => (state.isRegisterVisible = false))}
                onRegistered={() =>
                    update(() => {
                        // after successful register, bring them back to login (optional)
                        state.isRegisterVisible = false;
                        state.isDialogVisible = true;
                    })
                }
            />
		</>;

	//
	return html;
}

//
export default LogIn;