import { useState } from 'react';

import appState from '../app/appState';

import LogIn from './LogIn';
import DevelopmentLogIn from './DevelopmentLogIn';
import StatusAndLogOut from './StatusAndLogOut';


class State {
	isInitialized : boolean = false;

	/**
	 * Makes a shallow clone. Use this to return new state instance from state updates.
	 * @returns A shallow clone of this instance.
	 */
	shallowClone() : State {
		return Object.assign(new State(), this);
	}
}


function Auth() {
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

	//initialize
	if( !state.isInitialized )
	{
		//subscribe to app state changes
		appState.when(appState.isLoggedIn, () => {
			//this will force component re-rendering
			update(state => {});
		});

		//indicate initialization is done
		update(state => state.isInitialized = true);
	}

	//render component html
	let html = 
		<>
		{ !appState.isLoggedIn.value &&
			<>
			<LogIn/>
			{/*<DevelopmentLogIn/>*/}
			</>
		}
		{ appState.isLoggedIn.value &&
			<StatusAndLogOut/>
		}
		</>;

	//
	return html;
}

//
export default Auth;