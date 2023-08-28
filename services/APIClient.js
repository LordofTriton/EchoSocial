import axios from "axios"
import AppConfig from "../util/config"

function post(url, data, headers) {
    return axios.post(`${AppConfig.API}${url}`, data, {
        headers
    })
}

function put(url, data, headers) {
    return axios.put(`${AppConfig.API}${url}`, data)
}

function get(url, headers) {
    return axios.get(`${AppConfig.API}${url}`)
}

function del(url, headers) {
    return axios.delete(`${AppConfig.API}${url}`)
}

const APIClient = { post, put, get, del }

export default APIClient;