import mongoose from "mongoose";

const contactFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
});

const ContactFormSubmission = mongoose.model(
  "ContactFormSubmission",
  contactFormSchema,
);

export default ContactFormSubmission;
