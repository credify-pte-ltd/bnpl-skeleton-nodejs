const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader.split(" ").length === 1) {
        return "";
    }
    return authHeader.split(" ")[1];
};

module.exports = extractToken;
