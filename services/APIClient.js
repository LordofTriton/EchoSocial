import axios from "axios"
import AppConfig from "../util/config"

function post(url, data, headers) {
    return axios.post(`${url}`, data, {
        headers
    })
}

function put(url, data, headers) {
    return axios.put(`${url}`, data)
}

function get(url, headers) {
    return axios.get(`${url}`)
}

function del(url, headers) {
    return axios.delete(`${url}`)
}

const APIClient = { post, put, get, del }

export default APIClient;