import Note from '../models/note_model';

export async function createNote(noteFields) {
  const note = new Note();
  note.title = noteFields.title;
  note.content = noteFields.content || '';
  note.tags = noteFields.tags || [];
  note.associatedCompany = noteFields.associatedCompany || null;
  note.associatedNote = noteFields.associatedNote || null;

  try {
    const savedNote = await note.save();
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
    return Note.deleteOne({ _id: note._id });
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
    if (associatedCompany) {
      note.associatedCompany = associatedCompany;
    }
    if (associatedPerson) {
      note.associatedPerson = associatedPerson;
    }
    return note.save();
  } catch (error) {
    throw new Error(`delete note error: ${error}`);
  }
}
