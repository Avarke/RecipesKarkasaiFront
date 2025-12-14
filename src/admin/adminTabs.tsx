import { NavLink } from "react-router-dom";

function AdminTabs() {
    return (
        <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
                <NavLink
                    to="/admin/recipes"
                    className={({ isActive }) =>
                        "nav-link " + (isActive ? "active" : "")
                    }
                >
                    Recipes
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink
                    to="/admin/categories"
                    className={({ isActive }) =>
                        "nav-link " + (isActive ? "active" : "")
                    }
                >
                    Categories
                </NavLink>
            </li>


            <li className="nav-item">
                <NavLink
                    to="/admin/reviews"
                    className={({ isActive }) =>
                        "nav-link " + (isActive ? "active" : "")
                    }
                >
                    Reviews
                </NavLink>
            </li>

            <li className="nav-item">
                <NavLink
                    to="/admin/recipes/pending"
                    className={({ isActive }) => "nav-link " + (isActive ? "active" : "")}
                >
                    Pending
                </NavLink>
            </li>
        </ul>
    );
}

export default AdminTabs;