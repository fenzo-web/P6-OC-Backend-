require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    //const [rest, token] = req.headers.authorization.split(" "); another possibility
    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
