export const isAuthenticated = () => {
    const token = localStorage.getItem('token');

    return token ? true : false;
};

export const setToken = (token: string | undefined) => {
    if (token === undefined) {
        console.warn('No token provided — not storing anything in localStorage.');
        return;
    }

    localStorage.setItem('token', token);
};


export const logout = () => {
    localStorage.removeItem('token');
};

export const getUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch('/api/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error('Unauthorized');

        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Failed to fetch user', error);
        return null;
    }
};

// check if token is expired
export const isTokenExpired = async (): Promise<boolean> => {
    const user = await getUser();
    return user ? false : true // fail safe: assume expired if undefined
};

