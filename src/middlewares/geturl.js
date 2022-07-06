const getUrl = (req, res, next) => {
    try {
        let getUrl = req.originalUrl;
        res.cookie('url', getUrl);
        next();
    } catch (error) {
        throw error
    }
}

module.exports = getUrl;