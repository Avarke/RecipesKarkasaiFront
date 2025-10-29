import axios from 'axios';

import config from '../app/config';
import appState from '../app/appState';
import backend, { setNonAuthenticatingBackend } from '../app/backend';


/**
 * Log-out section in nav bar. React component.
 * @returns Component HTML.
 */
function StatusAndLogOut() {
	/**
	 * Handles 'Log-out' command.
	 */
	let onLogOut = () => {
		//send log-out request to the backend
		backend.get(
			config.backendUrl + "/auth/logout",
			{
				params : {					
				}
			}
		)
		//logout ok
		.then(resp => {			
			//forget user information and JWT
			appState.userId = -1;
			appState.userTitle = "";
			appState.authJwt = "";

			//switch back non-authenticating backend connector
			setNonAuthenticatingBackend();

			//indicate user is logged out
			appState.isLoggedIn.value = false;
		})
		//login failed or backend error, show error message
		.catch(err => {
			//TODO: show some kind of error dialog? assume user is logged out anyway?
		});
	}

	//render component html
	let html = 
		<>
		<span className="d-flex align-items-center">
			<span>Welcome, {appState.userTitle}</span>
			<button 
				type="button"
				className="btn btn-primary btn-sm ms-2" 
				onClick={() => onLogOut()}
				>Log out</button>
		</span>
		</>;

	//
	return html;
}

//
export default StatusAndLogOut;