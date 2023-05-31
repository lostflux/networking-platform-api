import mongoose from 'mongoose';
import axios from 'axios';
import { resolvePreset } from '@babel/core/lib/config/files';
import Company from '../models/company_model';
import Person from '../models/person_model';
import User from '../models/user_model';

// eslint-disable-next-line import/prefer-default-export
export async function getEmails(query, userId) {
  try {
    const user = await User.findById(userId);
    if (query.company) {
      const { company: companyId } = query;
      getCompanyEmails(companyId, user);
    } else if (query.person) {
      const { person: personId } = query;
      return getPersonEmails(personId, user);
    }
    return [];
  } catch (error) {
    throw new Error(`get email error: ${error}`);
  }
}

async function getCompanyEmails(companyId, user) {
  const company = await Company.findById(companyId);

  const googleAccessToken = await refreshForAccess(user);

  const res = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${user.email}/messages/?q=from:${company.emailDomain}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${googleAccessToken}`,
    },
  });

  let listOfMessages = res.data.messages;
  if (company.lastTrackedEmailInteractionId) {
    const lastInteractedEmailIndex = listOfMessages.findIndex((message) => { return message.id === company.lastTrackedEmailInteractionId; });
    if (lastInteractedEmailIndex !== -1) {
      listOfMessages = listOfMessages.splice(lastInteractedEmailIndex);
    }
  }

  if (listOfMessages.length === 0) {
    company.lastTrackedEmailInteractionId = res.data.messages[0].id;
  }
  // console.log(base64url.decode(res.data.raw));
}

async function getPersonEmails(personId, user) {
  const person = await Person.findById(personId);

  const googleAccessToken = await refreshForAccess(user);

  if (googleAccessToken) {
    try {
      console.log('hi');
      const res = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/yizhen.zhen.24@dartmouth.edu/messages?q=from:${person.email}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleAccessToken}`,
        },
      });

      let listOfMessages = res.data.messages;

      console.log(person.lastTrackedEmailInteractionId);
      if (person.lastTrackedEmailInteractionId) {
        const lastInteractedEmailIndex = listOfMessages.findIndex((message) => { return message.id === person.lastTrackedEmailInteractionId; });
        if (lastInteractedEmailIndex !== -1) {
          listOfMessages = listOfMessages.slice(0, lastInteractedEmailIndex);
        }
      }
      if (listOfMessages) {
        if (listOfMessages.length !== 0) {
          person.lastTrackedEmailInteractionId = listOfMessages[0].id;
        }

        const emailContent = await getEmailContent(googleAccessToken, listOfMessages.map((message) => { return message.id; }));
        const emailContentWithId = emailContent.map((email) => { return email.snippet; });
        person.emailInteractions.push(...emailContentWithId);
        await person.save();
      }
      return person.emailInteractions;
      // eslint-disable-next-line no-plusplus

      // console.log(base64url.decode(res.data.raw));
    } catch (error) {
      console.log(error);
      return person.emailInteractions;
    }
  }
}

async function refreshForAccess(user) {
  let retryCount = 0;

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
        }
      );
      return accessTokenCall.data.access_token;
    } catch (error) {
      if (error.code === 'ECONNRESET' && retryCount < 3) {
        // Retry the refreshForAccess call
        retryCount++;
        console.log('Connection reset by the server. Retrying...');
        return refreshToken();
      }

      console.log(error.cause);
      return null;
    }
  };
  return refreshToken();
}
async function getEmailContent(googleAccessToken, messageIdList) {
  const results = [];

  const getContent = async (accessToken, messageId) => {
    try {
      const res = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/yizhen.zhen.24@dartmouth.edu/messages/${messageId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Process the response or do something with it
      // ...

      return res.data; // Return the data if needed
    } catch (error) {
      if (error.code === 'ECONNRESET') {
        // Retry the getContent call
        console.log('Connection reset by the server. Retrying...');
        return getContent(accessToken, messageId);
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
        const content = await getContent(googleAccessToken, messageId);
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

