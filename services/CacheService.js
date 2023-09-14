const cache = require('memory-cache');

async function saveData(key, value) {
    if (key == null || value == null) return;
    await cache.put(key, value)
}

function getData(key) {
    if (key != null) return cache.get(key)
    return null;    
}

function deleteData(key) {
    if (key != null) cache.del(key)
    return null;    
}

function clearData() {
    cache.clear()
}

const CacheService = {
    saveData,
    getData,
    deleteData,
    clearData
}

export default CacheService;