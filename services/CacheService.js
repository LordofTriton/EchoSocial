function saveData(key, value) {
    if (!key || !value) return;
    let data = JSON.stringify(value)
    if (typeof window !== undefined) localStorage.setItem(key, data)
}

function getData(key) {
    if (!key || typeof window === undefined) return null;
    let data = localStorage.getItem(key)
    return data ? JSON.parse(data) ? JSON.parse(data) : data : null;
}

function deleteData(key) {
    if (key && typeof window !== undefined) localStorage.removeItem(key)
    return null;    
}

function clearData() {
    if (typeof window !== undefined) localStorage.clear();
}

const CacheService = {
    saveData,
    getData,
    deleteData,
    clearData
}

export default CacheService;