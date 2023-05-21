import mongoose, { Schema } from 'mongoose';

const PeopleSchema = new Schema({
  name: String,
  title: String,
  website: String,
  linkedin: String,
  description: String,
  tags: [String],
  associatedCompany: Schema.Types.ObjectId,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

PeopleSchema.index({ name: 'text', title: 'text', tags: 'text' });

const PeopleModel = mongoose.model('People', PeopleSchema);

export default PeopleModel;
