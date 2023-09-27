function saveData(key, value) {
    if (!key || !value) return;
    localStorage.setItem(key, value)
}

function getData(key) {
    if (!key) return null;
    let data = localStorage.getItem(key)
    return data ? data : null;  
}

function deleteData(key) {
    if (!key) localStorage.removeItem(key)
    return null;    
}

function clearData() {
    localStorage.clear();
}

const CacheService = {
    saveData,
    getData,
    deleteData,
    clearData
}

export default CacheService;