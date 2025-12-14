import { Routes, Route } from 'react-router-dom'
import RecipesList from "../RecipesList";
import RecipeCreate from "../recipesCrud/RecipeCreate";
import AdminRecipesList from "./AdminRecipesList";
import RecipeEdit from "../recipesCrud/RecipeEdit";
import AdminPendingRecipesList from "./AdminPendingRecipesList";




/**
 * CRUD operations on a single kind of entity. This component defines a router for
 * components of concrete operations. React component.
 * @returns Component HTML.
 */
function AdminRecipeCrud() {
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

                {/* /admin/recipes/pending */}
                <Route path="pending" element={<AdminPendingRecipesList />} />
            </Routes>
        </>

    //
    return html;
}

//
export default AdminRecipeCrud;