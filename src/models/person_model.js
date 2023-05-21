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
  associatedCompany: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
  notes: [Map],
  tags: [String],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

PersonSchema.index({ name: 'text', title: 'text', tags: 'text' });

const PersonModel = mongoose.model('person', PersonSchema);

export default PersonModel;
