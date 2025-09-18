import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protectRoute = async (req ,res , next) => {
    try {
        const token = req.cookies.jwt ; 
        if(!token) {
            return res.status(401).json({message : 'Unauthorized - No Token Provide'}) ; 
        }
        const decode = jwt.verify(token , process.env.JWT_SECRET) ; 
        if(!decode) {
             return res.status(401).json({message : 'Unauthorized -  Invalid Token'}) ; 
        }
         const user =await User.findById(decode.userId).select("-password") ; 
         if(!user) {
         return res.status(401).json({message : 'User Not Found '}) ; 

         }
         // save user in req object 
         req.user = user ; 
          next() ; 

    } catch (error) {
        console.log("Error in protectRoute " , error)  ; 
    }
}

export default protectRoute ;