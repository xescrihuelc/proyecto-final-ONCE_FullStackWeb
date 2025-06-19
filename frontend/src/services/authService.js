export const login = async (email, password) => {
    let mockUser = null;

    if (email === "admin@vic.com" && password === "1234") {
        mockUser = {
            email,
            role: "admin",
            token: "mock-token-123",
        };
    } else if (email === "manager@vic.com" && password === "1234") {
        mockUser = {
            email,
            role: "manager",
            token: "mock-token-456",
        };
    } else if (email === "trabajador@vic.com" && password === "1234") {
        mockUser = {
            email,
            role: "trabajador",
            token: "mock-token-789",
        };
    } else {
        throw new Error("Credenciales inválidas");
    }

    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("token", mockUser.token);
    return mockUser;
};

export const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");

export const getUserData = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};
