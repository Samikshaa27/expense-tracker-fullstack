import axios from "axios";

// Use environment variable for the API URL, falling back to local IP for dev convenience
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://192.168.1.7:5269/api"
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

    return API.get("/Expense", {
        headers: { Authorization: `Bearer ${token}` },
        params
    });
};

// DELETE EXPENSE
export const deleteExpense = (id, token) =>
    API.delete(`/Expense/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

// ADD EXPENSE
export const addExpense = (data, token) =>
    API.post("/Expense", data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

// DASHBOARD SUMMARY  { totalExpenses, totalTransactions, topCategory }
export const getDashboard = (token) =>
    API.get("/Expense/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
    });

// SUMMARY  { totalExpenses, totalTransactions }
export const getSummary = (token) =>
    API.get("/Expense/summary", {
        headers: { Authorization: `Bearer ${token}` }
    });

// CATEGORY SUMMARY  [{ category, total }]
export const getCategorySummary = (token) =>
    API.get("/Expense/category-summary", {
        headers: { Authorization: `Bearer ${token}` }
    });

// AI FINANCIAL COACH
export const getFinancialCoach = (token) =>
    API.get("/ai/financial-coach", {
        headers: { Authorization: `Bearer ${token}` }
    });

// AI CHATBOT
export const askChatbot = (message, token) =>
    API.post("/ai/chat", { message }, {
        headers: { Authorization: `Bearer ${token}` }
    });