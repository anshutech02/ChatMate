import axios from "axios"
import backendUrl from "./backendUrl"

const instance = axios.create({
    baseURL: backendUrl,
    withCredentials: true
})

export default instance;
