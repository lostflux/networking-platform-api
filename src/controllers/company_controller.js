import mongoose from 'mongoose';
import axios from 'axios';
import Company from '../models/company_model';
import Person from '../models/person_model';
import Note from '../models/note_model';
import Task from '../models/task_model';
import User from '../models/user_model';

export async function createCompany(companyFields, userId) {
  console.log('create company');
  console.log(companyFields);
  const company = new Company();
  company.name = companyFields.name;
  company.website = companyFields.website || '';
  company.linkedin = companyFields.linkedin || '';
  company.emailDomain = companyFields.emailDomain || '';
  company.imageUrl = companyFields.imageUrl || '';
  company.location = companyFields.location || '';
  company.description = companyFields.description || '';
  company.tags = companyFields.tags || [];
  company.notes = companyFields.notes || [];
  company.tasks = companyFields.tasks || [];
  company.associatedPeople = companyFields.associatedPeople || [];
  company.author = userId;

  try {
    const dupCompany = await Company.findOne({ name: company.name, author: userId });
    if (dupCompany) {
      throw new Error('Company already exists');
    }
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`Create company error: ${error}`);
  }
}

export async function getCompanies(query, userId) {
  try {
    console.log(query.q);
    let companies;
    if (query.q) {
      const { q: searchTerms } = query;
      companies = await Company.find({ author: userId, $text: { $search: searchTerms } }, 'name website location description imageUrl tags');
      console.log(companies);
    } else if (query.ids) {
      // eslint-disable-next-line new-cap
      const searchIds = query.ids.split(',').map((id) => { return new mongoose.Types.ObjectId(id); });
      companies = await Company.find({ author: userId, _id: { $in: searchIds } }, 'name website location description imageUrl tags');
    } else {
      companies = await Company.find({ author: userId }, 'name website location description imageUrl tags');
    }
    return companies;
  } catch (error) {
    console.log(error);
    throw new Error(`get company error: ${error}`);
  }
}

export async function getCompany(id, userId) {
  try {
    const company = await Company.findById(id);
    if (!company) {
      throw new Error('unable to find company');
    }

    if (userId !== company.author.toString()) {
      throw new Error('No permission error');
    }

    return company;
  } catch (error) {
    throw new Error(`get company error: ${error}`);
  }
}

export async function deleteCompany(id, userId) {
  try {
    const company = await Company.findById(id);
    if (!company) {
      throw new Error('unable to find company');
    }

    if (userId !== company.author.toString()) {
      throw new Error('No permission error');
    }
    if (company.associatedPeople) {
      company.associatedPeople.forEach(async (personId) => {
        const associatedPerson = await Person.findById(personId);
        associatedPerson.associatedCompany = null;
        await associatedPerson.save();
      });
    }

    if (company.notes) {
      company.notes.forEach(async (noteId) => {
        const noteFound = await Note.findById(noteId);
        if (noteFound.associatedPerson) {
          noteFound.associatedCompany = null;
          await noteFound.save();
        } else {
          await Note.deleteOne({ _id: noteId });
        }
      });
    }

    if (company.tasks) {
      company.tasks.forEach(async (taskId) => {
        const taskFound = await Task.findById(taskId);
        if (taskFound.associatedPerson) {
          taskFound.associatedCompany = null;
          await taskFound.save();
        } else {
          await Task.deleteOne({ _id: taskId });
        }
      });
    }
    const deletedCompany = await Company.deleteOne({ _id: company._id });
    return deletedCompany;
  } catch (error) {
    throw new Error(`delete company error: ${error}`);
  }
}

export async function updateCompany(id, companyFields, userId) {
  try {
    const company = await Company.findById(id);
    if (!company) {
      throw new Error('unable to find company');
    }

    if (userId !== company.author.toString()) {
      throw new Error('No permission error');
    }

    const {
      name, website, linkedin, emailDomain, imageUrl, description, location, tags, associatedPeople, notes, tasks,
    } = companyFields;
    if (name) {
      company.name = name;
    }
    if (website) {
      company.website = website;
    }
    if (emailDomain) {
      company.emailDomain = emailDomain;
    }
    if (imageUrl) {
      company.imageUrl = imageUrl;
    }
    if (linkedin) {
      company.linkedin = linkedin;
    }
    if (location) {
      company.location = location;
    }
    if (description) {
      company.description = description;
    }
    if (tags) {
      company.tags = tags;
    }
    if (associatedPeople) {
      company.associatedPeople = associatedPeople;
    }
    if (notes) {
      company.notes = notes;
    }
    if (tasks) {
      company.tasks = tasks;
    }

    return company.save();
  } catch (error) {
    throw new Error(`delete company error: ${error}`);
  }
}
