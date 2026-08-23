import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No Authorisation Token" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log(err);
        res.status(403).json({ error: "Invalid Token" })
    }
}

export default authMiddleware;