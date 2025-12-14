import { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'


import { Toast } from 'primereact/toast';

import appState from './appState';

import './App.scss';
import { jwtDecode } from "jwt-decode";


import NavMenu from '../navmenu/NavMenu';
import Footer from '../footer/Footer';
import About from '../about/About';
import EntityCrud from '../entityCrud/EntityCrud';
import RecipesList from '../recipes/RecipesList';
import RecipeDetails from '../recipes/RecipeDetails';
import AdminRecipeCrud from "../recipes/admin/AdminRecipeCrud";
import {setAccessToken, setAuthenticatingBackend} from './backend';
import RecipeCategoryCrud from "../categories/categoryCrud/CategoryCrud";
import ReviewCrud from "../reviews/admin/AdminReviewCrud";
import UserRecipeCrud from "../recipes/user/UserRecipeCrud";
import AdminReviewCrud from "../reviews/admin/AdminReviewCrud";
import UserReviewCrud from "../reviews/user/UserReviewCrud";

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


function CategoryCrud() {
    return null;
}

/**
 * Application. React component.
 * @returns Component HTML.
 */
function App() {
	//get state container and state updater
	const [state, setState] = useState(new State());

	//get ref to interact with the toast
	const toastRef = useRef<Toast>(null);


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

	//initialize
	if( !state.isInitialized )
	{
		//subscribe to app state changes
		appState.when(appState.isLoggedIn, () => {
			//this will force component re-rendering
			updateState(state => {});
		});

		//subscribe to user messages
		appState.msgs.subscribe(msg => {
			update(() => toastRef.current?.show(msg));
		});

		//if JWT is set, replace backend connector with authenticating one
        if (appState.authJwt && appState.authJwt.trim() !== "") {
            const token = appState.authJwt;

            const decoded = jwtDecode<any>(token);
            const rawRole =
                decoded.role ??
                decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

            const roles =
                Array.isArray(rawRole) ? rawRole :
                    typeof rawRole === "string" ? [rawRole] :
                        [];

            appState.userRoles = roles;

            //console.log("Extracted roles:", roles);

            appState.userTitle =
                decoded.unique_name ??
                decoded.name ??
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
                "";

            setAuthenticatingBackend(token);
            setAccessToken(token);

            appState.isLoggedIn.value = true;
        } else {
            appState.isLoggedIn.value = false;
        }

		//indicate initialization is done
		updateState(state => state.isInitialized = true);
	}

    const requireAdmin = (element: JSX.Element) => {

        console.log("requireAdmin check:", {
            isLoggedIn: appState.isLoggedIn.value,
            roles: appState.userRoles,
            isAdmin: appState.isAdmin,
        });


        if (!appState.isLoggedIn.value) return <Navigate to="/recipes" replace />;
        if (!appState.isAdmin) return <Navigate to="/recipes" replace />;
        return element;
    };

    const requireUserOnly = (element: JSX.Element) => {

        console.log("requireUserOnly check:", {
            isLoggedIn: appState.isLoggedIn.value,
            roles: appState.userRoles,
            isAdmin: appState.userRoles.includes("Admin"),
            isUserOnly:
                appState.userRoles.includes("SiteUser") &&
                !appState.userRoles.includes("Admin"),
        });

        if (!appState.isLoggedIn.value) {
            return <Navigate to="/recipes" replace />;
        }

        // block admins
        if (appState.userRoles.includes("Admin")) {
            return <Navigate to="/recipes" replace />;
        }

        // block non-users (safety)
        if (!appState.userRoles.includes("SiteUser")) {
            return <Navigate to="/recipes" replace />;
        }

        return element;
    };


	//render component HTML
	let html =
		<Router>
			<NavMenu/>
			<Toast ref={toastRef} position="top-right"/>
			<div className="shadow-sm bg-body rounded flex-grow-1 p-1">
				<Routes>
                    <Route path="/about" element={<About />} />  {/* About page */}
                    <Route path="/" element={<Navigate to="/recipes" />} />
                    <Route path="/recipes" element={<RecipesList />} />
                    <Route path="/recipes/:id" element={<RecipeDetails />} />

                            <Route path="/admin/recipes/*" element={requireAdmin(<AdminRecipeCrud />)} />
                            <Route path="/admin/categories/*" element={requireAdmin(<RecipeCategoryCrud />)} />
                            <Route path="/admin/reviews/*" element={requireAdmin(<AdminReviewCrud />)} />

                            <Route path="/user/recipes/*" element={requireUserOnly(<UserRecipeCrud />)} />
                            <Route path="/user/reviews/*" element={requireUserOnly(<UserReviewCrud />)} />

                    <Route path="*" element={<Navigate to="/recipes" replace />} />
				</Routes>
				{/*{ !appState.isLoggedIn.value &&*/}
				{/*	<div className="d-flex flex-column h-100 justify-content-center align-items-center">*/}
				{/*		<span className="alert alert-primary mx-2">Please, log in to see content.</span>*/}
				{/*	</div>*/}
				{/*}*/}
			</div>
			<Footer/>
		</Router>;
	
	//
	return html;
}

export default App;