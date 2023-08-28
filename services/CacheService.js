import Cookies from 'js-cookie';

function saveData(key, value) {
    if (!key || !value) return;
    const data = JSON.stringify(value);
    Cookies.set(key, data, { expires: 1 });
}

function getData(key) {
    if (key) {
        const data = Cookies.get(key);
        return data ? JSON.parse(data) : {};
    }
    return null;    
}

function deleteData(key) {
    if (key) Cookies.remove(key);
}

const Cache = { saveData, getData, deleteData }

export default Cache;