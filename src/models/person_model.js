import mongoose, { Schema } from 'mongoose';

const PersonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  title: String,
  email: String,
  linkedin: String,
  description: String,
  location: String,
  associatedCompany: { type: Schema.Types.ObjectId, ref: 'Company' },
  notes: [new Schema({
    title: String,
    noteId: { type: Schema.Types.ObjectId, ref: 'Note' },
  }, { _id: false })],
  tags: [String],
  tasks: [new Schema({
    title: String,
    taskId: { type: Schema.Types.ObjectId, ref: 'Note' },
  }, { _id: false })],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

PersonSchema.index({ name: 'text', title: 'text', tags: 'text' });

const PersonModel = mongoose.model('Person', PersonSchema);

export default PersonModel;
