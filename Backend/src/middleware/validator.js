import Joi from "joi";

const signupSchema = Joi.object({
  firstName: Joi.string().required().trim().messages({
    "string.empty": "First name is required",
  }),
  lastName: Joi.string().required().trim().messages({
    "string.empty": "Last name is required",
  }),
  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required",
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must match the password",
    "string.empty": "Confirm password is required",
  }),
});

const signinSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

export const validateSignup = (req, res, next) => {
  console.log("Validating signup body:", req.body);
  const { error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.warn(
      "Signup validation failed:",
      error.details.map((d) => d.message),
    );
    return res.status(400).json({
      success: false,
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }
  next();
};

export const validateSignin = (req, res, next) => {
  console.log("Validating signin body:", req.body);
  const { error } = signinSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.warn(
      "Signin validation failed:",
      error.details.map((d) => d.message),
    );
    return res.status(400).json({
      success: false,
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }
  next();
};
