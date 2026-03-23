import axios from "axios"


const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost/api";

const instance =  axios.create({
    baseURL: baseURL,
    headers :{
       "Content-Type":"application/json", 
    }
});


export default instance;