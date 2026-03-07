import axios from "axios";

let rawBaseURL = process.env.REACT_APP_API_URL || "https://expense-tracker-fullstack-production-d71e.up.railway.app/api";

// Auto-fix missing protocol (must start with http or https)
if (rawBaseURL && !rawBaseURL.startsWith("http")) {
    rawBaseURL = `https://${rawBaseURL}`;
}

// Clean the URL: strip any trailing slashes to prevent double-slash errors
const finalBaseURL = rawBaseURL.replace(/\/+$/, "");
console.log("🚀 FINAL API Base URL (Clean):", finalBaseURL);

const API = axios.create({
    baseURL: finalBaseURL
});

// LOGIN
export const loginUser = (data) =>
    API.post("/Auth/login", data);

// REGISTER
export const registerUser = (data) =>
    API.post("/Auth/register", data);

// GET EXPENSES (with optional date filter & pagination)
export const getExpenses = (token, { startDate, endDate, page = 1, pageSize = 50 } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    params.page = page;
    params.pageSize = pageSize;

    return API.get("/Expenses", {
        headers: { Authorization: `Bearer ${token}` },
        params
    });
};

// DELETE EXPENSE
export const deleteExpense = (id, token) =>
    API.delete(`/Expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

// ADD EXPENSE
export const addExpense = (data, token) =>
    API.post("/Expenses", data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

// DASHBOARD SUMMARY  { totalExpenses, totalTransactions, topCategory }
export const getDashboard = (token) =>
    API.get("/Expenses/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
    });

// SUMMARY  { totalExpenses, totalTransactions }
export const getSummary = (token) =>
    API.get("Expenses/summary", {
        headers: { Authorization: `Bearer ${token}` }
    });

// CATEGORY SUMMARY  [{ category, total }]
export const getCategorySummary = (token) =>
    API.get("/Expenses/category-summary", {
        headers: { Authorization: `Bearer ${token}` }
    });

// AI FINANCIAL COACH
export const getFinancialCoach = (token) =>
    API.get("ai/financial-coach", {
        headers: { Authorization: `Bearer ${token}` }
    });

// AI CHATBOT
export const askChatbot = (message, token) =>
    API.post("ai/chat", { message }, {
        headers: { Authorization: `Bearer ${token}` }
    });