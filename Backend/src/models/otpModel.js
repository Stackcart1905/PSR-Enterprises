import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId:  
  { 
    type: mongoose.Schema.Types.ObjectId, ref: "User",
     required: true
     },
  otp: {
     type: String, 
     required: true 
    },
  expiresAt: {
     type: Date,
      required: true 
    },
    purpose: {
  type: String,
  enum: ["signup", "reset"],
  required: true,
} , 
} , { timestamps: true});

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
