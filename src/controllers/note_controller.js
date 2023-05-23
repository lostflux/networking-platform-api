import Note from '../models/note_model';
import Company from '../models/company_model';
import Person from '../models/person_model';

// Problem to fix later: Can't unassociate note from person
// Problem to fix later: Can't unassociate note from company

export async function createNote(noteFields) {
  const note = new Note();
  note.title = noteFields.title;
  note.content = noteFields.content || '';
  note.tags = noteFields.tags || [];
  note.associatedCompany = noteFields.associatedCompany || null;
  note.associatedPerson = noteFields.associatedPerson || null;

  try {
    await note.validate();
    if (note.associatedPerson) {
      await addToAssociatedPerson(note.associatedPerson, noteFields.associatedCompany, note);
    } else if (note.associatedCompany) {
      await addToAssociatedCompany(note.associatedCompany, note);
    }
    const savedNote = await note.save();
    console.log(savedNote);
    return savedNote;
  } catch (error) {
    throw new Error(`create note error: ${error}`);
  }
}

export async function getNotes() {
  try {
    const notes = await Note.find({}, 'title tags content');
    return notes;
  } catch (error) {
    throw new Error(`get note error: ${error}`);
  }
}

export async function findNotes(query) {
  try {
    const searchedNote = await Note.find({ $text: { $search: query } }, 'title tags content');
    return searchedNote;
  } catch (error) {
    throw new Error(`get note error: ${error}`);
  }
}

export async function getNote(id) {
  try {
    const note = await Note.findById(id);
    if (!note) {
      throw new Error('unable to find note');
    }
    return note;
  } catch (error) {
    throw new Error(`get note error: ${error}`);
  }
}

export async function deleteNote(id) {
  try {
    const note = await Note.findById(id);
    if (note.associatedPerson) {
      deleteFromExAssociatedPerson(note);
    }
    if (note.associatedCompany) {
      deleteFromExAssociatedCompany(note);
    }
    const deletedNote = await Note.deleteOne({ _id: id });
    return deletedNote;
  } catch (error) {
    throw new Error(`delete note error: ${error}`);
  }
}

export async function updateNote(id, noteFields) {
  try {
    const note = await Note.findById(id);
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
      await deleteFromExAssociatedCompany(note);
      await deleteFromExAssociatedPerson(note);
      await addToAssociatedPerson(associatedPerson, associatedCompany, note);
      note.associatedPerson = associatedPerson;
    } else if (associatedCompany && note.associatedCompany.toString() !== associatedCompany) {
      await note.validate();
      if (note.associatedPerson) {
        throw new Error('cannot associate note to a new company if it is already associated with a person in existing company');
      }
      await deleteFromExAssociatedCompany(note);
      await addToAssociatedCompany(associatedCompany, note);
      note.associatedCompany = associatedCompany;
    }
    const savedNote = await note.save();
    return savedNote;
  } catch (error) {
    throw new Error(`update note error: ${error}`);
  }
}

async function addToAssociatedCompany(companyId, note) {
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

async function deleteFromExAssociatedCompany(note) {
  try {
    const company = await Company.findById(note.associatedCompany);
    company.notes.pull(note.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}

async function addToAssociatedPerson(personId, companyId, note) {
  try {
    const person = await Person.findById(personId);
    if (!person) {
      throw new Error('unable to find person');
    }
    if (companyId) {
      if (person.associatedCompany && person.associatedCompany.toString() !== companyId) {
        throw new Error('mismatch between associated company and associated person');
      } else {
        addToAssociatedCompany(companyId, note);
        note.associatedCompany = companyId;
      }
    } else if (person.associatedCompany) {
      addToAssociatedCompany(person.associatedCompany, note);
      note.associatedCompany = person.associatedCompany;
    }
    person.notes.push(note.id);
    const savedPerson = await person.save();
    return savedPerson;
  } catch (error) {
    throw new Error(`update associated person error: ${error}`);
  }
}

async function deleteFromExAssociatedPerson(note) {
  try {
    const person = await Person.findById(note.associatedPerson);
    person.notes.pull(note.id);
    const savedPerson = await person.save();
    return savedPerson;
  } catch (error) {
    throw new Error(`update associated person error: ${error}`);
  }
}
