
function GenerateAccessToken() {
    return String(Date.now())
}

const TokenGenerator = {
    GenerateAccessToken
}

export default TokenGenerator;