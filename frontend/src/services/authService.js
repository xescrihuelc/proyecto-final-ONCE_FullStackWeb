// src/services/authService.js

export const login = async (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = {
                "admin@vic.com": {
                    user: {
                        id: 1,
                        nombre: "Administrador VIC",
                        email: "admin@vic.com",
                    },
                    token: "admin-token-123",
                    role: "admin",
                },
                "manager@vic.com": {
                    user: {
                        id: 2,
                        nombre: "Manager VIC",
                        email: "manager@vic.com",
                    },
                    token: "manager-token-456",
                    role: "manager",
                },
                "trabajador@vic.com": {
                    user: {
                        id: 3,
                        nombre: "Trabajador VIC",
                        email: "trabajador@vic.com",
                    },
                    token: "trabajador-token-789",
                    role: "trabajador",
                },
            };

            if (users[email] && password === "1234") {
                resolve(users[email]);
            } else {
                reject("Credenciales inválidas");
            }
        }, 500);
    });
};

export const logout = () => {
    localStorage.clear();
};

export const getToken = () => {
    return localStorage.getItem("token");
};
