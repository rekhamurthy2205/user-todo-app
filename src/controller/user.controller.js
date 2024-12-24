const { LOG } = require("../../utils/logger");
const responseStructure = require("../../utils/responseStructure");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body.insertData;

    if (!username || !email || !password) {
      const responseMessage = responseStructure.errorResponse(
        "Missing required fields: username, email, or password"
      );
      return res.send(responseMessage);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const responseMessage = responseStructure.errorResponse(
        "Email already exists"
      );
      return res.send(responseMessage);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const createData = {
        username,
        email,
        password: hashedPassword,
      };

      const newUser = new User(createData);
      await newUser.save();

      const responseMessage = responseStructure.successResponse(
        "Your registration was completed successfully"
      );
      res.send(responseMessage);
    }
  } catch (error) {
    console.error("Error in processing registration:", error);
    const responseMessage = responseStructure.errorResponse(
      "Error in processing registration"
    );
    res.status(500).send(responseMessage);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body.insertData;

    const userRecord = await User.findOne({ email });

    if (userRecord) {
      const isMatch = await bcrypt.compare(password, userRecord.password);

      if (isMatch) {
        const accessToken = generateToken(userRecord._id);
        const refreshToken = generateRefreshToken(userRecord._id);

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        const responseMessage =
          responseStructure.successResponse("Login successfully");
        responseMessage.responseObj.responseDataParams = {
          userId: userRecord._id,
          accessToken,
        };

        console.log("JWT_SECRET:", process.env.JWT_SECRET);
        console.log("REFRESH_SECRET:", process.env.REFRESH_SECRET);
        console.log("NODE_ENV:", process.env.NODE_ENV);

        res.status(200).send(responseMessage);
      } else {
        const responseMessage = responseStructure.errorResponse(
          "Your password is incorrect"
        );
        return res.status(400).send(responseMessage);
      }
    } else {
      const responseMessage = responseStructure.errorResponse(
        "Unable to find user"
      );
      return res.send(responseMessage);
    }
  } catch (error) {
    console.error("Error in login:", error); // Debugging
    const responseMessage = responseStructure.errorResponse(
      "An error occurred during login"
    );
    res.status(500).send(responseMessage);
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      const responseMessage = responseStructure.errorResponse(
        "Refresh token not found"
      );
      return res.status(401).send(responseMessage);
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err) {
        const responseMessage = responseStructure.errorResponse(
          "Invalid refresh token"
        );
        return res.status(403).send(responseMessage);
      }

      // Generate a new access token
      const newAccessToken = generateToken(decoded.userId);

      const responseMessage = responseStructure.successResponse(
        "Access token refreshed successfully"
      );
      responseMessage.responseObj.responseDataParams = {
        accessToken: newAccessToken,
      };

      res.status(200).send(responseMessage);
    });
  } catch (error) {
    console.error(error);
    const responseMessage = responseStructure.errorResponse(
      "An error occurred while refreshing the token"
    );
    res.status(500).send(responseMessage);
  }
};

module.exports = { register, login, refreshAccessToken };
