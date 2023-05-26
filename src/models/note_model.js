import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: String,
  tags: [String],
  associatedCompany: { type: Schema.Types.ObjectId, ref: 'Company' },
  associatedPerson: { type: Schema.Types.ObjectId, ref: 'Person' },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
}, { _id: false });

NoteSchema.index({ title: 1, author: 1, content: 'text', _id: 1 });

const NoteModel = mongoose.model('Note', NoteSchema);

export default NoteModel;
