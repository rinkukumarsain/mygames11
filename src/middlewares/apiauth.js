const jwt = require('jsonwebtoken');

const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        console.log("verify", token);
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        if (!decoded) {
            throw new Error()
        }
        req.user = decoded;
        next();

    } catch (e) {
        token = {
            status: false,
            msg: 'Invalid Token'
        }
        return res.status(401).json(Object.assign({ success: false }, token));
    }
}
module.exports = auth;