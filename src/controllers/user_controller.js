import jwt from 'jwt-simple';
import axios from 'axios';
import dotenv from 'dotenv';
import base64url from "base64url";
import jwtdecode from "jwt-decode";
import User from '../models/user_model';

export const signin = (user) => {
  return tokenForUser(user);
};

// note the lovely destructuring here indicating that we are passing in an object with these 3 keys
export const signup = async ({
  firstName, lastName, email, password,
}) => {
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
};

export async function updateUser(userFields, id) {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('unable to find user');
    }

    const {
      googleEmail,
    } = userFields;
    if (googleEmail) {
      user.googleEmail = googleEmail;
    }

    const savedUser = await user.save();
    return savedUser.googleEmail;
  } catch (error) {
    throw new Error(`update user error: ${error}`);
  }
}

// Google auth was done mostly by myself with some help using https://www.youtube.com/watch?v=0KoZSVnTnkA&ab_channel=CooperCodes
export const setGoogleAuth = async (userId, code) => {
  const user = await User.findById(userId);
  console.log(code);
  const res = await axios.post(
    'https://oauth2.googleapis.com/token',
    {},
    {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      params: {
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code',
      },
    },
  );
  console.log(res.data);
  user.googleToken = res.data.refresh_token;
  //user.googleEmail = jwtdecode(res.data.id_token).email;
  //console.log(user.googleToken);
  await user.save();
};

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}
