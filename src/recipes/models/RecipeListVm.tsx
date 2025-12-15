import {PublishStatus} from "./PublishStatus";

export interface RecipeListVm {
    id: number;
    title: string;
    description: string | null;
    publish_status: PublishStatus;
    average_rating: number;
    categoryId: number;
    categoryName: string;
}


