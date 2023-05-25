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

TaskSchema.index({ title: 1, dueDate: 1, author: 1 });

const TaskModel = mongoose.model('Task', TaskSchema);

export default TaskModel;
