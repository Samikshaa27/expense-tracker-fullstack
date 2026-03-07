const API_BASE_URL = "https://expense-tracker-fullstack-production-d71e.up.railway.app/api";

export async function registerUser(data) {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function loginUser(data) {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function getExpenses(token) {
    const response = await fetch(`${API_BASE_URL}/Expense`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    return response.json();
}
