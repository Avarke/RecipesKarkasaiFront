import { NavLink } from "react-router-dom";

import Auth from '../auth/Auth';

import './NavMenu.scss'
import appState from "../app/appState";


/**
 * Navigation menu. React component.
 * @returns Component HTML.
 */
function NavMenu() {
	//render component HTML
	let html =
        <header>
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
                <div className="container">
                    {/* Brand */}
                    <NavLink to="/" className="navbar-brand">
                        <i className="bi bi-fork-knife"></i> MyRecipes
                    </NavLink>

                    {/* Toggler for small screens */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Collapsible content */}
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        "nav-link " + (isActive ? "active" : "")
                                    }
                                >
                                    Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/about"
                                    className={({ isActive }) =>
                                        "nav-link " + (isActive ? "active" : "")
                                    }
                                >
                                    About Us
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                {appState.isLoggedIn.value && (
                                    <NavLink to="/recipesCrud/new" className={({ isActive }) =>
                                        "nav-link " + (isActive ? "active" : "")
                                    }
                                    >
                                        + New Recipe
                                    </NavLink>
                                )}
                            </li>
                        </ul>

                        {/* Search form */}
                        <form className="d-flex me-2" role="search">
                            <input
                                className="form-control me-2 search-input"
                                type="search"
                                placeholder="Search recipes..."
                                aria-label="Search"
                            />
                            <button className="btn btn-outline-success" type="submit">
                                Search
                            </button>
                        </form>



                        <Auth />
                        {/* Login button (replace later with Auth if needed) */}
                        {/*<NavLink to="/login" className="btn btn-outline-primary">*/}
                        {/*    Log In*/}
                        {/*</NavLink>*/}
                    </div>
                </div>
            </nav>
        </header>;

	//
	return html;
}

//export component
export default NavMenu;