import UserModel from "../model/User.model.js";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

// MIddleware for veriy user
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method === "GET" ? req.query : req.body;
    console.log(username);
    // check the user exist
    let user = await UserModel.findOne({ username });
    if (!user) return res.status(404).send({ error: "Can't find user..." });
    next();
  } catch (err) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

/* POST: http://localhost:8080/api/register
  @params : {
    "username": "example123",
    "password": "admin123",
    "email": "example@gmail.com",
    "firstName": "Jhon",
    "lastName": "Doe",
    "mobile": 08131212123,
    "address": "Apt.103, bubutan, Surabaya",
    "profile": ""
  }
*/
export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;

    console.log(req.body);
    // check existing user
    const existUsername = await UserModel.findOne({ username }).exec();
    if (existUsername)
      return res.status(403).json({ message: "Username already exist..." });

    // check existing email
    const existEmail = await UserModel.findOne({ email }).exec();
    if (existEmail)
      return res.status(403).json({ message: "Email already exist..." });

    //  hash password
    let hashPassowrd;
    if (password) {
      const genSalt = await bcrypt.genSalt(10);
      hashPassowrd = await bcrypt.hash(password, genSalt);
    }

    // create user
    const user = await UserModel.create({
      username,
      password: hashPassowrd,
      profile: profile || "",
      email,
    });

    return res
      .status(201)
      .json({ message: "User Register Successfully...", user });
  } catch (err) {
    return res.status(500).send(err);
  }
}

/* POST: http://localhost:8080/api/login
  @params : {
    "username": "example123",
    "password": "admin123",
  }
*/
export async function login(req, res) {
  const { username, password } = req.body;
  try {
    // Check user exist
    const user = await UserModel.findOne({
      username,
    }).exec();
    if (!user)
      return res.status(404).json({ message: "Username not Found..." });

    // Compare password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword)
      return res.status(401).json({ message: "Password does not match..." });

    // Create JWT
    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.ACCESS_SECRET_TOKEN,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      message: "Login Success...",
      username: user.username,
      accessToken,
    });
  } catch (err) {
    res.status(500).json(err);
  }
}

/* GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  const { username } = req.params;
  try {
    // Check username params
    if (!username)
      return res.status(501).json({ message: "Invalid username..." });

    // Check user exist
    const user = await UserModel.findOne({
      username,
    }).exec();
    if (!user)
      return res.status(404).json({ message: "Username not Found..." });

    // slice password field on user
    const { password, ...newUser } = Object.assign({}, user.toJSON());

    return res.status(201).json(newUser);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/* PUT: http://localhost:8080/api/updateUser 
@param : {
  "id": "<userId>"
}
body: {
  firstName: '',
  lastName: '',
    address: '',
    profile: ''
  }
*/
export async function updateUser(req, res) {
  const { userId } = req.user;
  try {
    if (!userId) return res.status(404).json({ message: "User not found..." });
    const body = req.body;

    // Update data
    const userUpdate = await UserModel.updateOne({ _id: userId }, body);
    if (!userUpdate)
      return res.status(400).json({ message: "Update User failed..." });

    return res.status(201).json({ message: "User updated..." });
  } catch (err) {
    return res.status(500).json(err);
  }
}

/* GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
  req.app.locals.OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/* GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res.status(201).send({ message: "Verify Successfully!" });
  }
  return res.status(400).send({ message: "Invalid OTP.." });
}

// Successfully redirect user when OTP is valid
/* GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ message: "Session expired!" });
}

// update the password when we have valid session
/* PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
  console.log(req.app.locals.resetSession);
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).json({ message: "Session expired..." });

    const { username, password } = req.body;

    // check user exist
    const userExist = await UserModel.findOne({ username });
    if (!userExist)
      return res.status(404).json({ message: "User not found..." });

    // hashing password
    const genSalt = await bcrypt.genSalt(10);
    const hashPassowrd = await bcrypt.hash(password, genSalt);

    // update user
    UserModel.updateOne(
      { username: userExist.username },
      {
        password: hashPassowrd,
      }
    )
      .then((data) => {
        return res.status(201).json({ message: "User updated...", data });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    return res.status(500).send(err);
  }
}
