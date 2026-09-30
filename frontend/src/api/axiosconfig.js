import axios from "axios"

const instance = axios.create({
    baseURL : "https://chatmate-lkzj.onrender.com",
    withCredentials: true
})

export default instance;
//"http://localhost:3000/"
