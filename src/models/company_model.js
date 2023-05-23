import mongoose, { Schema } from 'mongoose';

// ADD IMAGE URL TO COMPANY MODEL

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
  associatedPeople: [
    { type: Schema.Types.ObjectId, ref: 'Person' },
  ],
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

CompanySchema.index({ name: 'text', tags: 'text' });

const CompanyModel = mongoose.model('Company', CompanySchema);

export default CompanyModel;
