import axios from "axios";

export const api = axios.create({
    baseURL: "https://presentation-backend.onrender.com"
        // "http://127.0.0.1:8000",
});

