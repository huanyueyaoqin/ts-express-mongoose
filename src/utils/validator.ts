import validator from "validator";

interface RegisterInputError {
  username?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
}

export const validateRegisterInput = (
  username: string,
  password: string,
  confirmPassword: string,
  email: string
) => {
  let errors: RegisterInputError = {};
  if (username === undefined || validator.isEmpty(username)) {
    errors.username = "Username must not be empty";
  }
  if (password === undefined || validator.isEmpty(password)) {
    errors.password = "Password must not be empty";
  }
  if (confirmPassword === undefined || validator.isEmpty(confirmPassword)) {
    errors.confirmPassword = "confirmPassword must not be empty";
  }
  if (!validator.equals(password, confirmPassword)) {
    errors.confirmPassword = "password not equal confirmPassword";
  }
  if (email === undefined || validator.isEmpty(email)) {
    errors.email = "Email must not be empty";
  }

  if (!validator.isEmail(email)) {
    errors.email = "Email must be a valid email address";
  }

  return { errors, valid: Object.keys(errors).length < 1 };
};