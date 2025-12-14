import axios from 'axios';

import config from '../app/config';
import appState from '../app/appState';
import backend, { setNonAuthenticatingBackend } from '../app/backend';

import '../navmenu/NavMenu.scss'
import {notifyFailure, notifySuccess} from "../app/notify";
import {forceLogout} from "./tokenService";

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
		backend.post("/logout")
		//logout ok
		.then(resp => {
            forceLogout();
		})
		//login failed or backend error, show error message
		.catch(err => {
            console.error("Logout failed:", err);
            // You might still want to clear local state:
            forceLogout();
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