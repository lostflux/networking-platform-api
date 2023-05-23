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
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  tags: [String],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

PersonSchema.index({ name: 'text', title: 'text', tags: 'text' });

const PersonModel = mongoose.model('Person', PersonSchema);

export default PersonModel;
