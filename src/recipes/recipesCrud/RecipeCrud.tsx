import { Routes, Route } from 'react-router-dom'
import RecipesList from "../RecipesList";
import RecipeCreate from "./RecipeCreate";
import AdminRecipesList from "./AdminRecipesList";
import RecipeEdit from "./RecipeEdit";




/**
 * CRUD operations on a single kind of entity. This component defines a router for
 * components of concrete operations. React component.
 * @returns Component HTML.
 */
function RecipeCrud() {
    //render component html
    let html =
        <>
            <Routes>
                {/* index route: /admin/recipes */}
                <Route index element={<AdminRecipesList />} />
                {/* /admin/recipes/new */}
                <Route path="create" element={<RecipeCreate />} />
                {/* /admin/recipes/edit/:id */}
                <Route path="edit/:id" element={<RecipeEdit />} />
            </Routes>
        </>

    //
    return html;
}

//
export default RecipeCrud;