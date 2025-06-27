// src/services/userService.js
import { API_URL } from "../utils/config";

const authHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const imp = localStorage.getItem("impersonateUserId");
    if (imp) headers["X-Impersonate-User"] = imp;
    return headers;
};

async function parseErrorBody(res) {
    const text = await res.text();

    // 1) ¿JSON válido con error?
    try {
        const obj = JSON.parse(text);
        return obj.error || JSON.stringify(obj);
    } catch {
        // 2) No es JSON: buscamos el primer <pre>…</pre>
        const preMatch = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
        if (preMatch) {
            // quitamos posibles tags internos y devolvemos limpio
            return preMatch[1].replace(/<[^>]+>/g, "").trim();
        }
        // 3) Fallback
        return `Error interno del servidor (${res.status})`;
    }
}

async function safeFetch(url, opts) {
    const res = await fetch(url, opts);
    if (!res.ok) {
        const msg = await parseErrorBody(res);
        throw new Error(msg);
    }
    // parseamos JSON solo si el content-type lo indica
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : null;
}

export const getAllUsers = () =>
    safeFetch(`${API_URL}/users`, { headers: authHeaders() });

export const createUser = (usuario) =>
    safeFetch(`${API_URL}/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(usuario),
    });

export const updateUser = (id, updates) =>
    safeFetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(updates),
    });

export const deleteUser = (id) =>
    safeFetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
