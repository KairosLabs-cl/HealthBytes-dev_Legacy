const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function addFavorite(productId: number, token: string) {
    const res = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error adding favorite');
    }

    return res.json();
}

export async function removeFavorite(productId: number, token: string) {
    const res = await fetch(`${API_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok && res.status !== 404) {
        const error = await res.json();
        throw new Error(error.detail || 'Error removing favorite');
    }
}

export async function getUserFavorites(token: string) {
    const res = await fetch(`${API_URL}/favorites`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error('Error fetching favorites');
    }

    return res.json();
}

export async function checkFavorite(productId: number, token: string) {
    const res = await fetch(`${API_URL}/favorites/check/${productId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error('Error checking favorite');
    }

    return res.json();
}

export async function getFavoriteIds(token: string): Promise<number[]> {
    const res = await fetch(`${API_URL}/favorites/ids`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error('Error fetching favorite IDs');
    }

    return res.json();
}
