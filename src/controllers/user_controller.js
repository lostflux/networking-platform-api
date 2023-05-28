import User from '../models/user_model';
import jwt from 'jwt-simple';
import dotenv from 'dotenv';

export const signin = (user) => {
  return tokenForUser(user);
}

//note the lovely destructuring here indicating that we are passing in an object with these 3 keys
export const signup = async ({ firstName, lastName, email, password }) => {
  if (!email || !password) {
    throw new Error('You must provide a name, email and password');
  }
  // See if a user with the given email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // If a user with email does exist, return an error
    throw new Error('Email is in use');
  }

  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.password = password;
  await user.save();
  return tokenForUser(user);
}

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}
