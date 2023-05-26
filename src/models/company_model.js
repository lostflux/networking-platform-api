import mongoose, { Schema } from 'mongoose';

// ADD IMAGE URL TO COMPANY MODEL

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  website: String,
  imageUrl: String,
  linkedin: String,
  description: String,
  location: String,
  tags: [String],
  associatedPeople: [
    { type: Schema.Types.ObjectId, ref: 'Person' },
  ],
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  author: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

CompanySchema.index({ name: 'text', author: 1, description: 'text', _id: 1 });

const CompanyModel = mongoose.model('Company', CompanySchema);

export default CompanyModel;
