import mongoose, { Schema } from 'mongoose';

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  website: String,
  linkedin: String,
  description: String,
  location: String,
  tags: [String],
  notes: [Map],
  associatedPeople: [
    { type: Schema.Types.ObjectId, ref: 'People' },
  ],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

CompanySchema.index({ name: 'text', tags: 'text' });

const CompanyModel = mongoose.model('Company', CompanySchema);

export default CompanyModel;
