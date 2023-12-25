// const HOST = "http://localhost:3000"
const HOST = "https://echo-social.vercel.app"

const API = HOST + "/api"

function getHost(req) {
    const protocol = req.headers['x-forwarded-proto'] || 'http'; // Use 'https' if available
    const host = req.headers.host;
    const fullUrl = `${protocol}://${host}`;
    return fullUrl;
}

const AppConfig = { HOST, API, getHost }

export default AppConfig;