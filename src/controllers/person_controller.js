import Person from '../models/person_model';
import Company from '../models/company_model';
import Note from '../models/note_model';
import Task from '../models/task_model';

export async function createPerson(personFields) {
  const person = new Person();
  person.name = personFields.name;
  person.linkedin = personFields.linkedin || '';
  person.description = personFields.description || '';
  person.imageUrl = person.imageUrl || '';
  person.location = personFields.location || '';
  person.notes = personFields.notes || [];
  person.tags = personFields.tags || [];
  person.tasks = personFields.tasks || [];
  person.associatedCompany = personFields.associatedCompany || null;
  person.title = personFields.title || '';
  person.email = personFields.email || '';

  try {
    await person.validate();
    if (person.associatedCompany) {
      await addToAssociatedCompany(person.associatedCompany, person);
    }
    const savedPerson = await person.save();
    return savedPerson;
  } catch (error) {
    throw new Error(`create person error: ${error}`);
  }
}

export async function getPeople() {
  try {
    const people = await Person.find({}, 'name title email tags associatedCompany');
    return people;
  } catch (error) {
    throw new Error(`get person error: ${error}`);
  }
}

export async function findPeople(query) {
  try {
    const searchedPeople = await Person.find({ $text: { $search: query } }, 'name title email tags associatedCompany');
    return searchedPeople;
  } catch (error) {
    throw new Error(`get person error: ${error}`);
  }
}

export async function getPerson(id) {
  try {
    const person = await Person.findById(id);
    if (!person) {
      throw new Error('unable to find person');
    }
    return person;
  } catch (error) {
    throw new Error(`get person error: ${error}`);
  }
}

export async function deletePerson(id) {
  try {
    const person = await Person.findById(id);
    if (person.associatedCompany) {
      await deleteFromExAssociatedCompany(person);
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

export async function updatePerson(id, personFields) {
  try {
    const person = await Person.findById(id);
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
        await deleteFromExAssociatedCompany(person);
      }
      await addToAssociatedCompany(associatedCompany, person);
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

async function addToAssociatedCompany(companyId, person) {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('unable to find company');
    }
    company.associatedPeople.push(person.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}

async function deleteFromExAssociatedCompany(person) {
  try {
    const company = await Company.findById(person.associatedCompany);
    if (!company) {
      throw new Error('unable to find company');
    }
    company.associatedPeople.pull(person.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}
