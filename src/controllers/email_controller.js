import mongoose from 'mongoose';
import axios from 'axios';
import base64url from 'base64url';
import Company from '../models/company_model';
import Person from '../models/person_model';
import User from '../models/user_model';

// Email interaction was done mostly by myself with documentation, but used some help from ChatGPT for the retries
// eslint-disable-next-line import/prefer-default-export, consistent-return
export async function getEmails(query, userId) {
  try {
    const user = await User.findById(userId);
    if (query.company) {
      const { company: companyId } = query;
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Invalid company id');
      }
      if (!company.emailDomain) {
        throw new Error('Company has no email domain (@example.com), please edit and fill it in.');
      }
      return getEmailInteractions(company, company.emailDomain, user);
    } else if (query.person) {
      const { person: personId } = query;
      const person = await Person.findById(personId);
      if (!person) {
        throw new Error('Invalid person id');
      }
      if (!person.email) {
        throw new Error('Person has no email, please edit and fill it in.');
      }
      return getEmailInteractions(person, person.email, user);
    } else {
      throw new Error('Invalid query error');
    }
  } catch (error) {
    throw new Error(`get email error: ${error}`);
  }
}

// eslint-disable-next-line consistent-return
async function getEmailInteractions(personOrCompany, personOrCompanyEmail, user) {
  const googleAccessToken = await refreshForAccess(user);

  if (googleAccessToken) {
    let retryCount = 0;
    let response = null;
    let error = null;

    while (retryCount < 3) {
      try {
        // eslint-disable-next-line no-await-in-loop
        response = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${user.googleEmail}/messages?q=from:${personOrCompanyEmail}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${googleAccessToken}`,
          },
        });

        // Break out of the retry loop if the request succeeds
        break;
      } catch (err) {
        error = err;
        if (retryCount < 2 && err.code === 'ECONNRESET') {
          // Log the error and retry
          console.log('Connection reset by the server. Retrying...');
          retryCount++;
        } else {
          throw new Error(`Failed to retrieve emails. Retries exhausted. Last error: ${error}`);
        }
      }
    }

    if (response.data.messages) {
      let listOfMessages = response.data.messages;
      listOfMessages = listOfMessages.slice(0, 20);
      if (personOrCompany.lastTrackedEmailInteractionId) {
        const lastInteractedEmailIndex = listOfMessages.findIndex((message) => { return message.id === personOrCompany.lastTrackedEmailInteractionId; });
        if (lastInteractedEmailIndex !== -1) {
          listOfMessages = listOfMessages.slice(0, lastInteractedEmailIndex);
        }
      }

      if (listOfMessages.length !== 0) {
        personOrCompany.lastTrackedEmailInteractionId = listOfMessages[0].id;
      }

      const convertToUTC = (timestamp) => {
        const date = new Date(timestamp * 1);
        return date;
      };

      const emailContent = await getEmailContent(user, googleAccessToken, listOfMessages.map((message) => { return message.id; }));
      const emailContentWithId = emailContent.map((email) => { return { emailSnippet: email.snippet, emailDate: convertToUTC(email.internalDate) }; });

      personOrCompany.emailInteractions.push(...emailContentWithId);
      await personOrCompany.save();

      return personOrCompany.emailInteractions;
    } else {
      if (personOrCompany.emailInteractions.length !== 0) {
        return personOrCompany.emailInteractions;
      }
      console.log('here');
      throw new Error(`No email interactions found for ${personOrCompanyEmail}`);
    }
  }
}

async function refreshForAccess(user) {
  let retryCount = 0;
  if (!user.googleToken) {
    throw new Error('User does not have a google token, please go to settings and set one up.');
  }

  const refreshToken = async () => {
    try {
      const accessTokenCall = await axios.post(
        'https://oauth2.googleapis.com/token',
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          params: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            refresh_token: user.googleToken,
            grant_type: 'refresh_token',
          },
        },
      );
      return accessTokenCall.data.access_token;
    } catch (error) {
      if (error.code === 'ECONNRESET' && retryCount < 3) {
        // Retry the refreshForAccess call
        retryCount++;
        console.log('Connection reset by the server. Retrying...');
        return refreshToken();
      }

      throw new Error(`Failed to retrieve access token. Retries exhausted. Last error: ${error}`);
    }
  };
  return refreshToken();
}
async function getEmailContent(user, googleAccessToken, messageIdList) {
  const results = [];
  const { googleEmail } = user;
  if (!googleEmail) {
    throw new Error('User does not have a google email, please go to settings and set one up.');
  }

  const getContent = async (googEmail, accessToken, messageId) => {
    try {
      const res = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${googEmail}/messages/${messageId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return res.data; // Return the data if needed
    } catch (error) {
      if (error.code === 'ECONNRESET') {
        // Retry the getContent call
        console.log('Connection reset by the server. Retrying...');
        return getContent(googleEmail, accessToken, messageId);
      }

      console.log(error);
      // Handle other errors if needed
      throw error; // Rethrow the error to be caught later
    }
  };

  for (let i = 0; i < messageIdList.length; i++) {
    const messageId = messageIdList[i];
    const retryCount = 3; // Maximum number of retries
    let attempt = 0;

    while (attempt <= retryCount) {
      try {
        const content = await getContent(googleEmail, googleAccessToken, messageId);
        results.push(content);
        break; // Exit the retry loop if successful
      } catch (error) {
        if (attempt === retryCount) {
          console.log(`Failed to get content for messageId: ${messageId}`);
        }
        attempt++;
      }
    }
  }

  return results;
}
