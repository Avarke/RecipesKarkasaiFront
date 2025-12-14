import { Routes, Route } from 'react-router-dom'
import RecipesList from "../RecipesList";
import RecipeCreate from "../recipesCrud/RecipeCreate";
import UserRecipesList from "./UserRecipesList";
import RecipeEdit from "../recipesCrud/RecipeEdit";




/**
 * CRUD operations on a single kind of entity. This component defines a router for
 * components of concrete operations. React component.
 * @returns Component HTML.
 */
function UserRecipeCrud() {
    //render component html
    let html =
        <>
            <Routes>
                {/* index route: /user/recipes */}
                <Route index element={<UserRecipesList />} />
                {/* /user/recipes/new */}
                <Route path="create" element={<RecipeCreate />} />
                {/* /user/recipes/edit/:id */}
                <Route path="edit/:id" element={<RecipeEdit />} />
            </Routes>
        </>

    //
    return html;
}

//
export default UserRecipeCrud;