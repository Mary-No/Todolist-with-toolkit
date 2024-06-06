import axios from "axios";


export const instance = axios.create({
    baseURL: 'https://social-network.samuraijs.com/api/1.1/',
    headers: {
        'API-KEY': '234c9bba-18f8-4dd2-860f-665d9f96e11c'
    }
})

instance.interceptors.request.use(function (config) {
    config.headers["Authorization"] = "Bearer " + localStorage.getItem("sn-token");

    return config;
});