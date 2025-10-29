import { Routes, Route } from 'react-router-dom'

import EntityCreate from './EntityCreate';
import EntityList from './EntityList';
import EntityEdit from './EntityEdit';


/**
 * CRUD operations on a single kind of entity. This component defines a router for 
 * components of concrete operations. React component.
 * @returns Component HTML.
 */
function EntityCrud() {
	//render component html
	let html = 
		<>
		<Routes>
			<Route path="/" element={<EntityList/>}/>
			<Route path="/create" element={<EntityCreate/>}/>
			<Route path="/edit/:entityId" element={<EntityEdit/>}/>
		</Routes>
		</>

	//
	return html;
}

//
export default EntityCrud;