import { useState } from 'react';
import axios from 'axios';

import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';

import config from '../app/config';
import appState from '../app/appState';
import backend, { setAuthenticatingBackend } from '../app/backend';

import { LogInResponse } from './models';


/**
 * Component state.
 */
class State
{
	/** Indicates if log-in dialog is visible. */
	isDialogVisible : boolean = false;


	/** Username, as entered. */
	username : string = "";

	/** Password, as entered. */
	password : string = "";


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
			if( state.username.trim() === "" )
				state.isUsernameErr = true;

			if( state.password === "" )
				state.isPasswordErr = true;

			//any fields invalid? abort
			let hasErrs =
				state.isUsernameErr ||
				state.isPasswordErr;

			if( hasErrs )
				return;

			//all fields valid, try loggin in
			//XXX: this is only secure over HTTPS, DO NOT SEND USER CREDENTIALS UNENCRYPTED in production code!
			backend.get<LogInResponse>(
				config.backendUrl + "/auth/login",
				{
					params : {
						username : state.username,
						password : state.password
					}
				}
			)
			//login ok
			.then(resp => {
				let data = resp.data;

				//save user information and JWT for subsequent authenticaton in backend requests
				appState.userId = data.userId;
				appState.userTitle = data.userTitle;
				appState.authJwt = data.jwt;

				//log JWT to browser console
				console.log(data.jwt);

				//replace backend connector with axios instance sending appropriate 'Authorization' header
				setAuthenticatingBackend(appState.authJwt);

				//indicate user is logged in
				appState.isLoggedIn.value = true;
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
			className="btn btn-primary btn-sm"
			onClick={() => update(() => state.isDialogVisible = true)}
			>Log in</button>
		<Dialog
			visible={state.isDialogVisible}
			onHide={() => update(() => state.isDialogVisible = false)}
			header={<span className="me-2">Enter your crendentials, please.</span>}
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
					value={state.username}
					onChange={(e) => update(() => state.username = e.target.value)}
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
					value={state.password}
					onChange={(e) => update(() => state.password = e.target.value)}
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
		</Dialog>
		</>;

	//
	return html;
}

//
export default LogIn;