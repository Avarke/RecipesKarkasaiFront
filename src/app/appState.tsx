import { Subject } from "rxjs";

import { ToastMessage } from 'primereact/toast';

import { ObservableClass } from "../observable/observable";


const STORAGE_KEY = "t120b178.frontend.AppState"

/**
 * Application state data.
 *
 * JWT authentication token is stored in session storage, that lives as long as related browser tab.
 * This allows user to log in and the properly trigger routes. 
 *
 * If we would store JWT in a simple variable the value would get lost when user would enter new url 
 * into browser.
 */
class AppState extends ObservableClass {
	/** User ID, if known. */
	userId : number = -1;

	/** User title, if known. */
	userTitle : string = "";
	
	/** Indicates if user is considered to be logged in. */
	isLoggedIn = this.observableProperty<boolean>(false);

	/** Is used to pass messages to app global toast control. */
	msgs = new Subject<ToastMessage>();

	/** Authentication token. Setter. */
	set authJwt(value : string | null) {
		if( value == null )
			window.sessionStorage.removeItem(`${STORAGE_KEY}#jwt`);
		else
			window.sessionStorage.setItem(`${STORAGE_KEY}#jwt`, value);
	}

	/** Authentication token. Getter. */
	get authJwt() : string | null {
		return window.sessionStorage.getItem(`${STORAGE_KEY}#jwt`);
	}	
}

//export default instance
let appState = new AppState();
export default appState;