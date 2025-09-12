import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // hardcode admin email 
        const adminEmail = process.env.ADMIN_EMAIL1;
        const adminEmail2 = process.env.ADMIN_EMAIL2;

        // check if email mathches admin email 
        if (email !== adminEmail && email !== adminEmail2) {
            return res.status(400).json({ success: false, error: 'Invalid email' });
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user
        user = new User({
            email,
            password: hashedPassword,
        });
        await user.save();

        // Create a JWT token and save token in cookie
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
        });


        res.status(201).json({ success: true, token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}



// login user 

const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }

        // Create and return a JWT token and save token in cookie
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
        });


        res.json({ success: true, token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Server error' });
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

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// check auth 
const checkAuth = async (req, res) => {

    try {
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);

        res.status(500).json({ success: false, message: "Internal Server error" });
    }

}


export { signup, signin, logout, checkAuth };