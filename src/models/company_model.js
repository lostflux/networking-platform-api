import mongoose, { Schema } from 'mongoose';

// ADD IMAGE URL TO COMPANY MODEL

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  website: String,
  emailDomain: String,
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
  lastTrackedEmailInteractionId: String,
  emailInteractions: [{
    emailDate: Date,
    emailSnippet: String,
  }],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

CompanySchema.index({ author: 1 });
CompanySchema.index({ name: 'text', description: 'text', associatedPeople: 'text', notes: 'text', tasks: 'text' });

const CompanyModel = mongoose.model('Company', CompanySchema);

export default CompanyModel;
