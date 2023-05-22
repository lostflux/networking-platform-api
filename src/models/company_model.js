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
  notes: [new Schema({
    title: String,
    noteId: { type: Schema.Types.ObjectId, ref: 'Note' },
  }, { _id: false })],
  associatedPeople: [
    { type: Schema.Types.ObjectId, ref: 'Person' },
  ],
  tasks: [new Schema({
    title: String,
    taskId: { type: Schema.Types.ObjectId, ref: 'Note' },
  }, { _id: false })],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

CompanySchema.index({ name: 'text', tags: 'text' });

const CompanyModel = mongoose.model('Company', CompanySchema);

export default CompanyModel;
