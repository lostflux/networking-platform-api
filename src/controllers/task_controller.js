import Task from '../models/task_model';
import Company from '../models/company_model';
import Person from '../models/person_model';

export async function createTask(taskFields, userId) {
  const task = new Task();
  task.title = taskFields.title;
  task.description = taskFields.description || '';
  task.tags = taskFields.tags || [];
  task.dueDate = taskFields.dueDate || null;
  task.associatedCompany = taskFields.associatedCompany || null;
  task.associatedPerson = taskFields.associatedPerson || null;
  task.author = userId;

  try {
    await task.validate();
    if (task.associatedPerson) {
      await addToAssociatedPerson(task.associatedPerson, taskFields.associatedCompany, task, userId);
    } else if (task.associatedCompany) {
      await addToAssociatedCompany(task.associatedCompany, task, userId);
    }
    const savedTask = await task.save();

    return savedTask;
  } catch (error) {
    throw new Error(`create task error: ${error}`);
  }
}

export async function getTasks(query, userId) {
  try {
    let tasks;
    if (query) {
      tasks = await Task.find({ author: userId, $text: { $search: query } }, 'title dueDate tags description associatedCompany associatedPerson');
    } else {
      tasks = await Task.find({ author: userId }, 'title dueDate tags description associatedCompany associatedPerson');
    }
    return tasks;
  } catch (error) {
    throw new Error(`get task error: ${error}`);
  }
}

export async function getTask(id, userId) {
  try {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error('unable to find task');
    }

    if (userId !== task.author.toString()) {
      throw new Error('No permission error');
    }
    return task;
  } catch (error) {
    throw new Error(`get task error: ${error}`);
  }
}

export async function deleteTask(id, userId) {
  try {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error('unable to find task');
    }

    if (userId !== task.author.toString()) {
      throw new Error('No permission error');
    }

    if (task.associatedPerson) {
      deleteFromExAssociatedPerson(task, userId);
    }
    if (task.associatedCompany) {
      deleteFromExAssociatedCompany(task, userId);
    }
    const deletedTask = await Task.deleteOne({ _id: task._id });
    return deletedTask;
  } catch (error) {
    throw new Error(`delete task error: ${error}`);
  }
}

export async function updateTask(id, taskFields, userId) {
  try {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error('unable to find task');
    }

    if (userId !== task.author.toString()) {
      throw new Error('No permission error');
    }
    const {
      title, description, dueDate, tags, associatedCompany, associatedPerson,
    } = taskFields;
    if (title) {
      task.title = title;
    }
    if (description) {
      task.description = description;
    }
    if (dueDate) {
      task.description = description;
    }
    if (tags) {
      task.tags = tags;
    }
    if (associatedPerson && task.associatedPerson.toString() !== associatedPerson) {
      await task.validate();
      await deleteFromExAssociatedCompany(task, userId);
      await deleteFromExAssociatedPerson(task, userId);
      await addToAssociatedPerson(associatedPerson, associatedCompany, task, userId);
      task.associatedPerson = associatedPerson;
    } else if (associatedCompany && task.associatedCompany.toString() !== associatedCompany) {
      if (task.associatedPerson) {
        throw new Error('cannot associate task to a new company if it is already associated with a person in existing company');
      }
      await task.validate();
      await deleteFromExAssociatedCompany(task, userId);
      await addToAssociatedCompany(associatedCompany, task, userId);
      task.associatedCompany = associatedCompany;
    }
    const savedTask = await task.save();
    return savedTask;
  } catch (error) {
    throw new Error(`update task error: ${error}`);
  }
}

async function addToAssociatedCompany(companyId, task, userId) {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('unable to find company');
    }
    if (company.author.toString() !== userId) {
      throw new Error('No permission error');
    }
    company.tasks.push(task.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}

async function deleteFromExAssociatedCompany(task, userId) {
  try {
    const company = await Company.findById(task.associatedCompany);
    if (!company) {
      throw new Error('unable to find company');
    }
    if (company.author.toString() !== userId) {
      throw new Error('No permission error');
    }
    company.tasks.pull(task.id);
    const savedCompany = await company.save();
    return savedCompany;
  } catch (error) {
    throw new Error(`update associated company error: ${error}`);
  }
}

async function addToAssociatedPerson(personId, companyId, task, userId) {
  try {
    const person = await Person.findById(personId);
    if (!person) {
      throw new Error('unable to find person');
    }
    if (person.author.toString() !== userId) {
      throw new Error('No permission error');
    }
    if (companyId) {
      if (person.associatedCompany && person.associatedCompany.toString() !== companyId) {
        throw new Error('mismatch between associated company and associated person');
      } else {
        addToAssociatedCompany(companyId, task, userId);
        task.associatedCompany = companyId;
      }
    } else if (person.associatedCompany) {
      addToAssociatedCompany(person.associatedCompany, task, userId);
      task.associatedCompany = person.associatedCompany;
    }
    person.tasks.push(task.id);
    const savedPerson = await person.save();
    return savedPerson;
  } catch (error) {
    throw new Error(`update associated person error: ${error}`);
  }
}

async function deleteFromExAssociatedPerson(task, userId) {
  try {
    const person = await Person.findById(task.associatedPerson);
    if (!person) {
      throw new Error('unable to find person');
    }
    if (person.author.toString() !== userId) {
      throw new Error('No permission error');
    }
    person.tasks.pull(task.id);
    const savedPerson = await person.save();
    return savedPerson;
  } catch (error) {
    throw new Error(`update associated person error: ${error}`);
  }
}
