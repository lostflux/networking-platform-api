import mongoose, { Schema } from 'mongoose';

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  tags: [String],
  dueDate: Date,
  associatedCompany: { type: Schema.Types.ObjectId, ref: 'Company' },
  associatedPerson: { type: Schema.Types.ObjectId, ref: 'Person' },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

TaskSchema.index({ name: 'text', content: 'text', tags: 'text' });

const TaskModel = mongoose.model('Task', TaskSchema);

export default TaskModel;
