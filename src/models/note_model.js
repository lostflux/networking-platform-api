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
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
}, { _id: false });

NoteSchema.index({ name: 'text', content: 'text', tags: 'text' });

const NoteModel = mongoose.model('Note', NoteSchema);

export default NoteModel;