import jwt from "jsonwebtoken";

export default async function Auth(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    // retrive the user detail
    const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
}

export function localVariable(req, res, next) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };

  next();
}
