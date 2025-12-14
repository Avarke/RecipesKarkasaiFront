export interface RecipeListVm {
    id: number;
    title: string;
    description: string | null;
    status: string;
    average_Rating: number;
    categories: string[];
}