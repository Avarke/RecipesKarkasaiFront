import { Routes, Route } from "react-router-dom";

import AdminCategoriesList from "./AdminCategoriesList";
import CategoryCreate from "./CategoryCreate";
import CategoryEdit from "./CategoryEdit";

/**
 * CRUD router for categories.
 */
function CategoryCrud() {
    return (
        <Routes>
            {/* /admin/categories */}
            <Route index element={<AdminCategoriesList />} />
            {/* /admin/categories/new */}
            <Route path="create" element={<CategoryCreate />} />
            {/* /admin/categories/edit/:id */}
            <Route path="edit/:id" element={<CategoryEdit />} />
        </Routes>
    );
}

export default CategoryCrud;
