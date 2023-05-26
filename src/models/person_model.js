import mongoose, { Schema } from 'mongoose';

const PersonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  title: String,
  imageUrl: String,
  email: String,
  linkedin: String,
  description: String,
  location: String,
  associatedCompany: { type: Schema.Types.ObjectId, ref: 'Company' },
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  tags: [String],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  author: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

PersonSchema.index({ name: 'text', author: 1, description: 'text', _id: 1 });

const PersonModel = mongoose.model('Person', PersonSchema);

export default PersonModel;
