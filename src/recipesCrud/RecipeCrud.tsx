import { Routes, Route } from 'react-router-dom'
import RecipesList from "../recipes/RecipesList";
import RecipeCreate from "./RecipeCreate";


function RecipeEdit() {
    return null;
}

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
                <Route path="/" element={<RecipesList/>}/>
                <Route path="/new" element={<RecipeCreate/>}/>
                <Route path="/edit/:entityId" element={<RecipeEdit/>}/>
            </Routes>
        </>

    //
    return html;
}

//
export default RecipeCrud;