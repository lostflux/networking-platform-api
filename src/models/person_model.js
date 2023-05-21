import mongoose, { Schema } from 'mongoose';

const PersonSchema = new Schema({
  name: String,
  title: String,
  email: String,
  linkedin: String,
  description: String,
  tags: [String],
  associatedCompany: Schema.Types.ObjectId,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

PersonSchema.index({ name: 'text', title: 'text', tags: 'text' });

const PersonModel = mongoose.model('person', PersonSchema);

export default PersonModel;
