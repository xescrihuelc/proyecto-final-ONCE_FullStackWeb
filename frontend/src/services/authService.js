const TOKEN_KEY = "vic_token";

export function login(username, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (username && password) {
                const fakeToken = "fake-jwt-token";
                localStorage.setItem(TOKEN_KEY, fakeToken);
                resolve(fakeToken);
            } else {
                reject("Credenciales inválidas");
            }
        }, 500);
    });
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
