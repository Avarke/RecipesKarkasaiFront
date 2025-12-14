import { Routes, Route } from 'react-router-dom'
import AdminReviewsList from "./AdminReviewsList";
import ReviewCreate from "../reviewCrud/ReviewCreate";
import ReviewEdit from "../reviewCrud/ReviewEdit";





/**
 * CRUD operations on a single kind of entity. This component defines a router for
 * components of concrete operations. React component.
 * @returns Component HTML.
 */
function AdminReviewCrud() {
    //render component html
    let html =
        <>
            <Routes>
                {/* index route: /admin/recipes */}
                <Route index element={<AdminReviewsList />} />
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
export default AdminReviewCrud;