import axios from "axios"
import AppConfig from "../util/config"

function post(url, data, headers) {
    return axios.post(`/api${url}`, data, {
        headers
    })
}

function put(url, data, headers) {
    return axios.put(`/api${url}`, data)
}

function get(url, headers) {
    return axios.get(`/api${url}`)
}

function del(url, headers) {
    return axios.delete(`/api${url}`)
}

const APIClient = { post, put, get, del }

export default APIClient;