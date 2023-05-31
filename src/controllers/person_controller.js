import mongoose from 'mongoose';
import Axios from 'axios';
import Person from '../models/person_model';
import Company from '../models/company_model';
import Note from '../models/note_model';
import Task from '../models/task_model';
import User from '../models/user_model';

export async function createPerson(personFields, userId) {
  const person = new Person();
  person.name = personFields.name;
  person.linkedin = personFields.linkedin || '';
  person.description = personFields.description || '';
  person.imageUrl = personFields.imageUrl || '';
  person.location = personFields.location || '';
  person.notes = personFields.notes || [];
  person.tags = personFields.tags || [];
  person.tasks = personFields.tasks || [];
  person.associatedCompany = personFields.associatedCompany || null;
  person.title = personFields.title || '';
  person.email = personFields.email || '';
  person.author = userId;

  try {
    await person.validate();
    if (person.associatedCompany) {
      await addToAssociatedCompany(person.associatedCompany, person, userId);
    }

    if (userId !== person.author.toString()) {
      throw new Error('No permission error');
    }
    const savedPerson = await person.save();
    return savedPerson;
  } catch (error) {
    throw new Error(`create person error: ${error}`);
  }
}

export async function getPeople(query, userId) {
  try {
    let people;
    if (query.q) {
      const { q: searchTerms } = query;
      people = await Person.find({ author: userId, $text: { $search: searchTerms } }, 'name title email description imageUrl tags associatedCompany');
    } else if (query.ids) {
      // eslint-disable-next-line new-cap
      const searchIds = query.ids.split(',').map((id) => { return new mongoose.Types.ObjectId(id); });
      people = await Person.find({ author: userId, _id: { $in: searchIds } }, 'name title email description imageUrl tags associatedCompany');
    } else if (query.companies) {
      const companyIds = query.companies.split(',').map((id) => { return new mongoose.Types.ObjectId(id); });
      people = await Person.find({ author: userId, associatedCompany: { $in: companyIds } }, 'name title email description imageUrl tags associatedCompany');
    } else if (query.notes) {
      const noteIds = query.notes.split(',').map((id) => { return new mongoose.Types.ObjectId(id); });
      people = await Person.find({ author: userId, associatedCompany: { $in: noteIds } }, 'name title email description imageUrl tags associatedCompany');
    } else if (query.tasks) {
      const taskIds = query.tasks.split(',').map((id) => { return new mongoose.Types.ObjectId(id); });
      people = await Person.find({ author: userId, tasks: { $in: taskIds } }, 'name title email description imageUrl tags associatedCompany');
    } else {
      people = await Person.find({ author: userId }, 'name title email description imageUrl tags associatedCompany');
    }

    return people;
  } catch (error) {
    throw new Error(`get person error: ${error}`);
  }
}

export async function getPerson(id, userId) {
  try {
    const person = await Person.findById(id);
    if (!person) {
      throw new Error('unable to find person');
    }

    if (userId !== person.author.toString()) {
      throw new Error('No permission error');
    }
    return person;
  } catch (error) {
    throw new Error(`get person error: ${error}`);
  }
}

export async function deletePerson(id, userId) {
  try {
    const person = await Person.findById(id);
    if (userId !== person.author.toString()) {
      throw new Error('No permission error');
    }
    if (person.associatedCompany) {
      await deleteFromExAssociatedCompany(person, userId);
    }
    if (person.notes) {
      person.notes.forEach(async (noteId) => {
        await Note.deleteOne({ _id: noteId });
      });
    }

    if (person.tasks) {
      person.tasks.forEach(async (taskId) => {
        await Task.deleteOne({ _id: taskId });
      });
    }

    const deletedPerson = await Person.deleteOne({ _id: person._id });
    return deletedPerson;
  } catch (error) {
    throw new Error(`delete person error: ${error}`);
  }
}

export async function updatePerson(id, personFields, userId) {
  try {
    const person = await Person.findById(id);

    if (!person) {
      throw new Error('unable to find person');
    }

    if (userId !== person.author.toString()) {
      throw new Error('No permission error');
    }

    const {
      name, title, linkedin, imageUrl, email, description, tags, associatedCompany, notes, tasks,
    } = personFields;
    if (name) {
      person.name = name;
      await person.validate();
    }
    if (title) {
      person.website = title;
    }
    if (linkedin) {
      person.linkedin = linkedin;
    }
    if (imageUrl) {
      person.imageUrl = imageUrl;
    }
    if (email) {
      person.email = email;
    }
    if (description) {
      person.description = description;
    }
    if (tags) {
      person.tags = tags;
    }
    if (associatedCompany && associatedCompany !== person.associatedCompany.toString()) {
      if (person.associatedCompany) {
        await deleteFromExAssociatedCompany(person, userId);
      }
      await addToAssociatedCompany(associatedCompany, person, userId);
      person.associatedCompany = associatedCompany;

      person.notes.forEach(async (noteId) => {
        const noteFound = await Note.findById(noteId);
        noteFound.associatedCompany = associatedCompany;
        await noteFound.save();
      });

      person.tasks.forEach(async (taskId) => {
        const taskFound = await Task.findById(taskId);
        taskFound.associatedCompany = associatedCompany;
        await taskFound.save();
      });
    }
    if (notes) {
      person.notes = notes;
    }
    if (tasks) {
      person.notes = tasks;
    }
    return person.save();
  } catch (error) {
    throw new Error(`delete person error: ${error}`);
  }
}

async function addToAssociatedCompany(companyId, person, userId) {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('unable to find company');
    }

    if (userId !== company.author.toString()) {
      throw new Error('No permission error');
    }
    company.associatedPeople.push(person.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}

async function deleteFromExAssociatedCompany(person, userId) {
  try {
    const company = await Company.findById(person.associatedCompany);
    if (!company) {
      throw new Error('unable to find company');
    }

    if (userId !== company.author.toString()) {
      throw new Error('No permission error');
    }
    company.associatedPeople.pull(person.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}


export const getEmails = async (id, userId) => {
  const user = await User.findById(userId);
  const company = await Company.findById(id);

  const googleAccessToken = await refreshForAccess(user);

  const res = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${user.googleEmail}/messages/?q=from:${company.emailDomain}`, {
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
};

async function refreshForAccess(user) {
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
}