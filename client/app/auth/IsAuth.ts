export const IsAuth = async (token: string) => {
    try {
        if (!token) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth/login';
            throw new Error('Authentication required');
        }

        const response = await fetch('http://localhost:8080/api/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth/login';
            throw new Error('User not authenticated');
        }

        const data = await response.json();

        if (data.success) {
            return {
                isAuthenticated: true,
                userProfile: data.data.user
            };
        } else {
            localStorage.removeItem('authToken');
            window.location.href = '/auth/login';
            throw new Error('Invalid response format');
        }

    } catch (error) {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
        console.error('Error authenticating user:', error);
        return { isAuthenticated: false, userProfile: null };
    }
}