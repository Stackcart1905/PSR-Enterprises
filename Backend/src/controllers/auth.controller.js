import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Otp from "../models/otpModel.js" ; 
import nodemailer from "nodemailer" ;

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message : "Invalid otp or email" ,success: false, error: "Invalid otp or email" });
    
 
    const otpDoc = await Otp.findOne({
      userId: user._id,
      purpose : "signup" ,
      expiresAt: { $gt: Date.now() }
    });

    if (!otpDoc) return res.status(400).json({message : "Invalid or expired OTP" , success: false, error: "Invalid or expired OTP" });

     const isMatch = await bcrypt.compare(otp, otpDoc.otp);
        if (!isMatch) {
            return res.status(400).json({ message : "Invalid Otp" , 
                success: false, 
                error: 'Invalid OTP' });
        }

    user.isVerified = true;
    await user.save();
    await Otp.deleteMany({ userId: user._id , purpose: "signup" }); // cleanup

     // Create a JWT token and save token in cookie
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

      res.cookie("jwt" , token , {
        maxAge : 7 * 24 * 60 * 60 * 1000 , 
        httpOnly : true , 
        sameSite : process.env.NODE_ENV != "development" ? "none" : "strict" , 
        secure : process.env.NODE_ENV != "development" ,
    })



        res.status(201).json({
             message : "Email Verified and registered successfully",
              success: true, 
              _id : user._id ,
               fullName : user.fullName ,
                email : user.email , 
                role : user.role
             });


  } catch (error) {
    console.error(error.message);
    res.status(500).json({message : "Internal Server error in verify email" , success: false});
  }
};



const sendOTP = async (user  , purpose) => {
    // delete old otp if exits
    await Otp.deleteMany({ userId: user._id , purpose }); 

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        await Otp.create({
          userId: user._id,
          otp: hashedOtp,
          purpose , 
         expiresAt: Date.now() + 5 * 60 * 1000, // 5 mins
         });
    // send email with otp

     const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP config
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });
   
    const subject = purpose === "reset" ? "Reset your password" : "Verify your email";
const text = purpose === "reset"
  ? `Your OTP to reset your password is ${otp}. It is valid for 5 minutes.`
  : `Your OTP to verify your email is ${otp}. It is valid for 5 minutes.`;

await transporter.sendMail({
  from: `"PSR Enterprises" <${process.env.APP_EMAIL}>`,
  to: user.email,
  subject,
  text,
});


}

// resend OTP
const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ 
        message: "Email is required", 
        success: false 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        message: "User not found", 
        success: false 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        message: "Email already verified", 
        success: false 
      });
    }

    // Generate and send new OTP
    await sendOTP(user , "signup");

    res.status(200).json({
      message: "OTP resent successfully. Please check your email.",
      success: true
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      message: "Internal Server error while resending OTP", 
      success: false 
    });
  }
};



const signup = async (req, res) => {
    let {fullName ,  email, password } = req.body;
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({message : "User already exists" ,
                 success: false, error: 'User already exists' });
        }
        if(!email || !password || !fullName ) {
            return res.status(400).json({ message : "Please enter all fields" , success : false , error : "Please enter all fields" }) ; 
        }

        email = email.toLowerCase() ;

        // hardcode admin email 
        const adminEmail = process.env.ADMIN_EMAIL1;
        const adminEmail2 = process.env.ADMIN_EMAIL2;

        // check if email mathches admin email 
       
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const role = (email === adminEmail || email === adminEmail2) ? 'admin' : 'user' ;

        // Create the new user
        user = new User({
            fullName , 
            email,
            password: hashedPassword,
            isVerified: false,
            role , 
        });


        await user.save();

        // genrate otp and send email for verification 
       await sendOTP(user, "signup"); 


        res.status(201).json({
             success: true,
             message: "User registered successfully. Please verify your email."
      });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error", success: false, error: 'Server error' });
    }
}



// login user 

const signin = async (req, res) => {
    let { email, password } = req.body;
    try {
        // Check for user
         if(!email || !password ) {
            return res.status(400).json({message : "Please enter all fields" , success : false , error : "Please enter all fields" }) ; 
        }

        email = email.toLowerCase() ;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({message : "Invalid credentials" , success: false, error: 'Invalid credentials' });
        }
      
        if (!user.isVerified) {
            return res.status(400).json({ message: "Email not verified", success: false, error: "Email not verified" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials", success: false, error: 'Invalid credentials' });
        }

        // Create and return a JWT token and save token in cookie
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
      res.cookie("jwt" , token , {
        maxAge : 7 * 24 * 60 * 60 * 1000 , 
        httpOnly : true , 
        sameSite : process.env.NODE_ENV != "development" ? "none" : "strict" , 
        secure : process.env.NODE_ENV != "development" ,
    })



        res.json({message : "Login successful" , success: true,  _id : user._id , fullName : user.fullName , email : user.email , role : user.role });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error", success: false, error: 'Server error' });
    }
}


//logout

const logout = async (req, res) => {
    try {
       res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
});

        return res.status(200).json({message : "Logged out successfully" , success: true });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

// check auth 
const checkAuth = async (req, res) => {

    try {
        res.status(200).json({message: "User authenticated successfully", success: true, user: req.user });
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);

        res.status(500).json({ message: "Internal Server error", success: false });
    }

}


// forget and reset password here

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // generate and send OTP for password reset
    await sendOTP(user , "reset");

    res.status(200).json({ success: true, message: "OTP sent to your email for password reset." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error in forgot password" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or OTP" });
    }

    const otpDoc = await Otp.findOne({
      userId: user._id,
      purpose : "reset" , 
      expiresAt: { $gt: Date.now() },
    });

    if (!otpDoc) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    // cleanup OTP
    await Otp.deleteMany({ userId: user._id  , purpose : "reset"});

    // log user in immediately with JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful. You are now logged in.",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error in reset password" });
  }
};



export { signup, signin, logout, checkAuth , verifyOtp , resendOtp , forgetPassword , resetPassword}; 