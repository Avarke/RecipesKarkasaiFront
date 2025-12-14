import { NavLink } from "react-router-dom";

function UserTabs() {
    return (
        <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
                <NavLink
                    to="/user/recipes"
                    className={({ isActive }) =>
                        "nav-link " + (isActive ? "active" : "")
                    }
                >
                    Recipes
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink
                    to="/user/reviews"
                    className={({ isActive }) =>
                        "nav-link " + (isActive ? "active" : "")
                    }
                >
                    Reviews
                </NavLink>
            </li>
        </ul>
    );
}

export default UserTabs;