import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/otpModel.js";
import nodemailer from "nodemailer";

//!     Helper: Send OTP
const sendOTP = async (user, purpose) => {
  //? Delete any existing OTP for this user & purpose
  await Otp.deleteMany({ userId: user._id, purpose });

  //? Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //? Hash OTP before storing
  const hashedOtp = await bcrypt.hash(otp, 10);

  //? Save OTP to DB with 5-min expiry
  await Otp.create({
    userId: user._id,
    otp: hashedOtp,
    purpose,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  //? Send OTP via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const subject =
    purpose === "reset" ? "Reset your password" : "Verify your email";
  const text =
    purpose === "reset"
      ? `Your OTP to reset your password is ${otp}. It is valid for 5 minutes.`
      : `Your OTP to verify your email is ${otp}. It is valid for 5 minutes.`;

  await transporter.sendMail({
    from: `"Swaadbhog Mewa Traders" <${process.env.APP_EMAIL}>`,
    to: user.email,
    subject,
    text,
  });
};

//!    Signup
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const sanitizedFirstName = (firstName || "").trim();
    const sanitizedLastName = (lastName || "").trim();
    const fullName =
      `${sanitizedFirstName} ${sanitizedLastName}`.trim() ||
      email.split("@")[0];
    const lowerEmail = email.toLowerCase();

    //? Check if user exists
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    //? Determine role
    const role =
      lowerEmail === process.env.ADMIN_EMAIL1 ||
      lowerEmail === process.env.ADMIN_EMAIL2
        ? "admin"
        : "user";

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Role", role, "for email:", lowerEmail);
    //? Create new user
    const user = await User.create({
      fullName,
      email: lowerEmail,
      password: hashedPassword,
      isVerified: false,
      role,
    });

    //! Send OTP for verification if email credentials exist.
    const hasEmailCreds = !!(process.env.APP_EMAIL && process.env.APP_PASSWORD);
    if (hasEmailCreds) {
      try {
        await sendOTP(user, "signup");
        return res.status(201).json({
          success: true,
          message:
            "User registered successfully. OTP sent to email for verification.",
        });
      } catch (err) {
        console.warn("Signup: failed to send OTP email:", err?.message);
        // keep user unverified in this case, require retry OTP
        return res.status(500).json({
          success: false,
          message:
            "Signup succeeded but OTP email failed to send. Please contact support or try again.",
        });
      }
    }

    // If email is not configured, only auto-verify in development mode.
    if (process.env.NODE_ENV === "development") {
      user.isVerified = true;
      await user.save();
      return res.status(201).json({
        success: true,
        message: "User registered in development mode (OTP bypass).",
      });
    }

    // Production without email provider should fail to avoid unverified accounts.
    return res.status(500).json({
      success: false,
      message:
        "Signup failed because email service is not configured. Please configure APP_EMAIL and APP_PASSWORD.",
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error during signup" });
  }
};

//!         Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otpDoc = await Otp.findOne({
      userId: user._id,
      purpose: "signup",
      expiresAt: { $gt: Date.now() },
    }).sort({ createdAt: -1 }); // always get the latest OTP

    if (!otpDoc)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });

    const isMatch = await bcrypt.compare(otp, otpDoc.otp);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Incorrect OTP" });

    //?  Mark user as verified
    user.isVerified = true;
    await user.save();

    //?  Remove used OTPs
    await Otp.deleteMany({ userId: user._id, purpose: "signup" });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

//!      Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.isVerified)
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });

    await sendOTP(user, "signup");

    res.status(200).json({
      success: true,
      message: "OTP resent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error while resending OTP" });
  }
};

//!     Signin
const signin = async (req, res) => {
  let { email, password } = req.body;
  console.log("Signin attempt for:", email);
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter all fields",
        success: false,
        error: "Please enter all fields",
      });
    }

    email = email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
        error: "Invalid email or password",
      });
    }

    //? Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified",
        success: false,
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        error: "Invalid email or password",
      });
    }

    //!  Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      secure: process.env.NODE_ENV !== "development",
    });

    res.json({
      message: "Login successful",
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token, // added for socket.io auth
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Server error",
      success: false,
      error: "Server error",
    });
  }
};

//!      Logout
const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error during logout" });
  }
};

//!       Check Auth
const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("CheckAuth Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during authentication check",
    });
  }
};

//!      Forget Password
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await sendOTP(user, "reset");

    res.status(200).json({
      success: true,
      message: "OTP sent to your email for password reset.",
    });
  } catch (error) {
    console.error("ForgetPassword Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

//!      Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or OTP" });

    const otpDoc = await Otp.findOne({
      userId: user._id,
      purpose: "reset",
      expiresAt: { $gt: Date.now() },
    });
    if (!otpDoc)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });

    const isMatch = await bcrypt.compare(otp, otpDoc.otp);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Incorrect OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Otp.deleteMany({ userId: user._id, purpose: "reset" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful. You are now logged in.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("ResetPassword Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error during password reset" });
  }
};

//!      Change Password (Authenticated)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("ChangePassword Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error during password change" });
  }
};

export {
  signup,
  verifyOtp,
  resendOtp,
  signin,
  logout,
  checkAuth,
  forgetPassword,
  resetPassword,
  changePassword,
};
