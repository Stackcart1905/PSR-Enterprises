import mongoose from 'mongoose' ; 

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
  phone: {
    type: String,
    required: false, // Phone is optional
  },
  businessType: {
    type: String,
    required: false,
    trim: true,
  },
  projectDetails : {
    type: String,
    required: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
});

const ContactFormSubmission = mongoose.model('ContactFormSubmission', contactFormSchema);

export default ContactFormSubmission  ; 