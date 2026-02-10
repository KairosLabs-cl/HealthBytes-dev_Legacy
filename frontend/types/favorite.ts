// Tipos para favoritos
export type Favorite = {
    id: number;
    user_id: number;
    product_id: number;
    created_at: string;
    product?: {
        id: string | number;
        name: string;
        price: number;
        image?: string;
        description?: string;
        stock?: number;
        category?: string;
        dietary_tags?: string[];
    };
};

export type FavoriteCreate = {
    product_id: number;
};

export type FavoriteCheckResponse = {
    is_favorite: boolean;
    favorite_id: number | null;
};
