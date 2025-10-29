import { useState } from 'react';
import axios from 'axios';

import { Dialog } from 'primereact/dialog';
 
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

	/**
	 * Makes a shallow clone. Use this to return new state instance from state updates.
	 * @returns A shallow clone of this instance.
	 */
	shallowClone() : State {
		return Object.assign(new State(), this);
	}
}


/**
 * Log-in section for development purposes only. React component.
 * @returns Component HTML.
 */
function DevelopmentLogIn() {
	//get state container and state updater
	const [state, updateState] = useState(new State());

	/**
	 * This is used to update state without the need to return new state instance explicitly.
	 * It also allows updating state in one liners, i.e., 'update(state => state.xxx = yyy)'.
	 * @param updater State updater function.
	 */
	let update = (updater : (state : State) => void) => {
		updateState(state => {
			updater(state);
			return state.shallowClone();
		})
	}

	/**
	 * Handles 'Log-in' command in dialog.
	 */
	let onLogIn = () => {
		//XXX: this is only secure over HTTPS, DO NOT SEND USER CREDENTIALS UNENCRYPTED in production code!
		backend.get<LogInResponse>(
			config.backendUrl + "/auth/login",
			{
				params : {
					username : "a",
					password : "b"
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
			update(state => state.isDialogVisible = true);
		});			
	}
	
	//render component html
	let html = 
		<>
		<button 
			type="button"
			className="btn btn-danger btn-sm ms-2" 
			onClick={() => onLogIn()}
			>Fast log in as 'a'</button>
		<Dialog 
			visible={state.isDialogVisible} 
			onHide={() => update(state => state.isDialogVisible = false)}
			header={<span className="me-2">Something went wrong...</span>}
			style={{width: "50ch"}}
			>
				<div className="alert alert-warning">Log in has failed. Incorrect username, password or backend failure.</div>
				<div className="d-flex justify-content-end">
					<button
						type="button"
						className="btn btn-primary" 
						onClick={() => update(state => state.isDialogVisible = false)}
						>Close</button>
				</div>
			</Dialog>
		</>;

	//
	return html;
}

//
export default DevelopmentLogIn;