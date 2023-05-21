import Task from '../models/task_model';

export async function createTask(taskFields) {
  const task = new Task();
  task.title = taskFields.title;
  task.description = taskFields.description || '';
  task.tags = taskFields.tags || [];
  task.dueDate = taskFields.dueDate || null;
  task.associatedCompany = taskFields.associatedCompany || null;
  task.associatedTask = taskFields.associatedTask || null;

  try {
    const savedTask = await task.save();
    return savedTask;
  } catch (error) {
    throw new Error(`create task error: ${error}`);
  }
}

export async function getTasks() {
  try {
    const tasks = await Task.find({}, 'title tags content');
    return tasks;
  } catch (error) {
    throw new Error(`get task error: ${error}`);
  }
}

export async function findTasks(query) {
  try {
    const searchedTask = await Task.find({ $text: { $search: query } }, 'title tags content');
    return searchedTask;
  } catch (error) {
    throw new Error(`get task error: ${error}`);
  }
}

export async function getTask(id) {
  try {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error('unable to find task');
    }
    return task;
  } catch (error) {
    throw new Error(`get task error: ${error}`);
  }
}

export async function deleteTask(id) {
  try {
    const task = await Task.findById(id);
    return Task.deleteOne({ _id: task._id });
  } catch (error) {
    throw new Error(`delete task error: ${error}`);
  }
}

export async function updateTask(id, taskFields) {
  try {
    const task = await Task.findById(id);
    const {
      title, description, dueDate, tags, associatedCompany, associatedPerson,
    } = taskFields;
    if (title) {
      task.title = title;
    }
    if (description) {
      task.content = description;
    }
    if (dueDate) {
      task.content = dueDate;
    }
    if (tags) {
      task.tags = tags;
    }
    if (associatedCompany) {
      task.associatedCompany = associatedCompany;
    }
    if (associatedPerson) {
      task.associatedPerson = associatedPerson;
    }
    return task.save();
  } catch (error) {
    throw new Error(`delete task error: ${error}`);
  }
}
