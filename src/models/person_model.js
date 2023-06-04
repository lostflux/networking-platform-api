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
  lastTrackedEmailInteractionId: String,
  emailInteractions: [{
    emailDate: Date,
    emailSnippet: String,
  }],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

PersonSchema.index({ author: 1, associatedCompany: 1 });

PersonSchema.index({ name: 'text', notes: 'text', tasks: 'text' });

const PersonModel = mongoose.model('Person', PersonSchema);

export default PersonModel;
