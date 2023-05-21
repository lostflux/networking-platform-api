import mongoose, { Schema } from 'mongoose';

const CompanySchema = new Schema({
  name: String,
  website: String,
  linkedin: String,
  description: String,
  tags: [String],
  associatedPeople: [
    { type: Schema.Types.ObjectId, ref: 'People' },
  ],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

CompanySchema.index({ name: 'text', tags: 'text' });

const CompanyModel = mongoose.model('Companies', CompanySchema);

export default CompanyModel;
