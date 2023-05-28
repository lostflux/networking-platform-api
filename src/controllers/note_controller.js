import mongoose from 'mongoose';
import Note from '../models/note_model';
import Company from '../models/company_model';
import Person from '../models/person_model';

// Problem to fix later: Can't unassociate note from person
// Problem to fix later: Can't unassociate note from company

export async function createNote(noteFields, userId) {
  const note = new Note();
  note.title = noteFields.title;
  note.content = noteFields.content || '';
  note.tags = noteFields.tags || [];
  note.associatedCompany = noteFields.associatedCompany || null;
  note.associatedPerson = noteFields.associatedPerson || null;
  note.author = userId;

  try {
    await note.validate();
    if (note.associatedPerson) {
      await addToAssociatedPerson(note.associatedPerson, noteFields.associatedCompany, note, userId);
    } else if (note.associatedCompany) {
      await addToAssociatedCompany(note.associatedCompany, note, userId);
    }
    const savedNote = await note.save();
    console.log(savedNote);
    return savedNote;
  } catch (error) {
    throw new Error(`create note error: ${error}`);
  }
}

export async function getNotes(query, userId) {
  try {
    let notes;
    if (query.q) {
      notes = await Note.find({ author: userId, $text: { $search: query } }, 'title tags content');
    } else if (query.companies) {
      const companyIds = query.companies.split(',').map((id) => { return new mongoose.Types.ObjectId(id); });
      notes = await Note.find({ author: userId, associatedCompany: { $in: companyIds } }, 'title tags content associatedCompany associatedPerson');
    } else if (query.people) {
      const peopleIds = query.people.split(',').map((id) => { return new mongoose.Types.ObjectId(id); });
      notes = await Note.find({ author: userId, associatedPerson: { $in: peopleIds } }, 'title tags content associatedCompany associatedPerson');
    } else {
      notes = await Note.find({ author: userId }, 'title tags content');
    }
    return notes;
  } catch (error) {
    throw new Error(`get note error: ${error}`);
  }
}

export async function getNote(id, userId) {
  try {
    const note = await Note.findById(id);
    if (!note) {
      throw new Error('unable to find note');
    }

    if (userId !== note.author.toString()) {
      throw new Error('No permission error');
    }
    return note;
  } catch (error) {
    throw new Error(`get note error: ${error}`);
  }
}

export async function deleteNote(id, userId) {
  try {
    const note = await Note.findById(id);
    if (!note) {
      throw new Error('unable to find note');
    }

    if (userId !== note.author.toString()) {
      throw new Error('No permission error');
    }
    if (note.associatedPerson) {
      deleteFromExAssociatedPerson(note, userId);
    }
    if (note.associatedCompany) {
      deleteFromExAssociatedCompany(note, userId);
    }
    const deletedNote = await Note.deleteOne({ _id: id });
    return deletedNote;
  } catch (error) {
    throw new Error(`delete note error: ${error}`);
  }
}

export async function updateNote(id, noteFields, userId) {
  try {
    const note = await Note.findById(id);
    if (!note) {
      throw new Error('unable to find note');
    }

    if (userId !== note.author.toString()) {
      throw new Error('No permission error');
    }
    const {
      title, content, tags, associatedCompany, associatedPerson,
    } = noteFields;
    if (title) {
      note.title = title;
    }
    if (content) {
      note.content = content;
    }
    if (tags) {
      note.tags = tags;
    }
    if (associatedPerson && associatedPerson !== note.associatedPerson.toString()) {
      await note.validate();
      await deleteFromExAssociatedCompany(note, userId);
      await deleteFromExAssociatedPerson(note, userId);
      await addToAssociatedPerson(associatedPerson, associatedCompany, note, userId);
      note.associatedPerson = associatedPerson;
    } else if (associatedCompany && note.associatedCompany.toString() !== associatedCompany) {
      await note.validate();
      if (note.associatedPerson) {
        throw new Error('cannot associate note to a new company if it is already associated with a person in existing company');
      }
      await deleteFromExAssociatedCompany(note, userId);
      await addToAssociatedCompany(associatedCompany, note, userId);
      note.associatedCompany = associatedCompany;
    }
    const savedNote = await note.save();
    return savedNote;
  } catch (error) {
    throw new Error(`update note error: ${error}`);
  }
}

async function addToAssociatedCompany(companyId, note, userId) {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('unable to find company');
    }
    company.notes.push(note.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}

async function deleteFromExAssociatedCompany(note, userId) {
  try {
    const company = await Company.findById(note.associatedCompany);
    if (!company) {
      throw new Error('unable to find company');
    }

    if (userId !== company.author.toString()) {
      throw new Error('No permission error');
    }
    company.notes.pull(note.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}

async function addToAssociatedPerson(personId, companyId, note, userId) {
  try {
    const person = await Person.findById(personId);
    if (!person) {
      throw new Error('unable to find person');
    }

    if (userId !== person.author.toString()) {
      throw new Error('No permission error');
    }
    if (companyId) {
      if (person.associatedCompany && person.associatedCompany.toString() !== companyId) {
        throw new Error('mismatch between associated company and associated person');
      } else {
        addToAssociatedCompany(companyId, note, userId);
        note.associatedCompany = companyId;
      }
    } else if (person.associatedCompany) {
      addToAssociatedCompany(person.associatedCompany, note, userId);
      note.associatedCompany = person.associatedCompany;
    }
    person.notes.push(note.id);
    const savedPerson = await person.save();
    return savedPerson;
  } catch (error) {
    throw new Error(`update associated person error: ${error}`);
  }
}

async function deleteFromExAssociatedPerson(note, userId) {
  try {
    const person = await Person.findById(note.associatedPerson);
    if (!person) {
      throw new Error('unable to find person');
    }

    if (userId !== person.author.toString()) {
      throw new Error('No permission error');
    }
    person.notes.pull(note.id);
    const savedPerson = await person.save();
    return savedPerson;
  } catch (error) {
    throw new Error(`update associated person error: ${error}`);
  }
}
