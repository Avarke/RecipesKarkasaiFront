import axios from 'axios';

import config from '../app/config';
import appState from '../app/appState';
import backend, { setNonAuthenticatingBackend } from '../app/backend';

import '../navmenu/NavMenu.scss'

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
            <div className="d-flex align-items-center gap-3">
                <span className="user-status">Welcome, {appState.userTitle}</span>
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => onLogOut()}
                >
                    Log out
                </button>
            </div>
		</>;

	//
	return html;
}

//
export default StatusAndLogOut;