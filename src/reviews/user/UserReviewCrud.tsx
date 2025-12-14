import { Routes, Route } from 'react-router-dom'
import UserReviewsList from "./UserReviewsList";
import ReviewCreate from "../reviewCrud/ReviewCreate";
import ReviewEdit from "../reviewCrud/ReviewEdit";





/**
 * CRUD operations on a single kind of entity. This component defines a router for
 * components of concrete operations. React component.
 * @returns Component HTML.
 */
function UserReviewCrud() {
    //render component html
    let html =
        <>
            <Routes>
                {/* index route: /admin/recipes */}
                <Route index element={<UserReviewsList />} />
                {/* /admin/recipes/new */}
                <Route path="create" element={<ReviewCreate />} />
                {/*/!* /admin/recipes/edit/:id *!/*/}
                <Route path="edit/:id" element={<ReviewEdit />} />
            </Routes>
        </>

    //
    return html;
}

//
export default UserReviewCrud;