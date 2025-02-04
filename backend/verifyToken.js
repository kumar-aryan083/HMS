import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.token;
        const t = JSON.stringify(token);
        if (!token) {
            return res.json({ success: false, message: 'token not found, login again' });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return next(res.json({ success: false, message: 'Please Login First' }))
            } else {
                req.user = user;
                next();
            }
        })
    } catch (error) {
        console.error(error);
    }
}