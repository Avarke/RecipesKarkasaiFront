
/**
 * Entity for lists.
 */
interface EntityForL {
	id: number;
	date: string;
	name: string;
	condition: number;
	deletable: boolean;
}

/**
 * Entity for creating and updating.
 */
class EntityForCU {
	id: number = -1;
	date: string = "";
	name: string = "";
	condition: number = 0;
	deletable: boolean = false;
}

//
export type {
	EntityForL
}

export {
	EntityForCU
}