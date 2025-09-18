import mongoose, { mongo } from "mongoose";

const userSchema = mongoose.Schema({
   fullName : {
    type : String , 
    required : true , 
    trim : true  , 
   } , 
   email : {
    type : String , 
    required : true , 
    lowercase: true, 
     unique : true  , 
     trim : true , 
   } , 
   password : {
    type : String , 
    required : true , 
   } , 
   isVerified: 
    { 
    type: Boolean,
     default: false
    },

   role : {
    type : String  , 
    required : true , 
    enum: ["user", "admin"],
    default : "user" , 
   } , 
} , {timestamps : true})  ; 


const User =  mongoose.model("User" , userSchema) ; 

export default User ; 