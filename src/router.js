import { Router } from 'express';
import { requireAuth, requireSignin } from './services/passport';
import * as Company from './controllers/company_controller';
import * as Person from './controllers/person_controller';
import * as Note from './controllers/note_controller';
import * as Task from './controllers/task_controller';
import * as User from './controllers/user_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

router.post('/signin', requireSignin, async (req, res) => {
  try {
    const token = User.signin(req.user);
    res.json({ token, email: req.user.email, id: req.user._id });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/signup', async (req, res) => {
  try {
    console.log(`req.body: ${req.body.email}`);
    const token = await User.signup(req.body);
    res.json({ token, email: req.body.email, id: req.user._id });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/companies', requireAuth, async (req, res) => {
  const companyFields = req.body;

  try {
    const result = await Company.createCompany(companyFields);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/companies', requireAuth, async (req, res) => {
  try {
    const result = await Company.getCompanies();
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/companies/search', requireAuth, async (req, res) => {
  const { q: searchTerm } = req.query;

  try {
    const result = await Company.findCompanies(searchTerm);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/companies/:id', requireAuth, async (req, res) => {
  const companyId = req.params.id;

  try {
    const result = await Company.getCompany(companyId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/companies/:id', requireAuth, async (req, res) => {
  const companyId = req.params.id;
  const companyFields = req.body;

  try {
    const result = await Company.updateCompany(companyId, companyFields);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.delete('/companies/:id', requireAuth, async (req, res) => {
  const companyId = req.params.id;

  try {
    const result = await Company.deleteCompany(companyId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post('/people', requireAuth, async (req, res) => {
  const personFields = req.body;

  try {
    const result = await Person.createPerson(personFields);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/people', requireAuth, async (req, res) => {
  try {
    const result = await Person.getPeople();
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/people/search', requireAuth, async (req, res) => {
  const { q: searchTerm } = req.query;

  try {
    const result = await Person.findPeople(searchTerm);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/people/:id', requireAuth, async (req, res) => {
  const personId = req.params.id;

  try {
    const result = await Person.getPerson(personId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/people/:id', requireAuth, async (req, res) => {
  const personId = req.params.id;
  const personFields = req.body;

  try {
    const result = await Person.updatePerson(personId, personFields);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.delete('/people/:id', requireAuth, async (req, res) => {
  const personId = req.params.id;

  try {
    const result = await Person.deletePerson(personId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post('/notes', requireAuth, async (req, res) => {
  const noteFields = req.body;

  try {
    const result = await Note.createNote(noteFields);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/notes', requireAuth, async (req, res) => {
  try {
    const result = await Note.getNotes();
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/notes/search', requireAuth, async (req, res) => {
  const { q: searchTerm } = req.query;

  try {
    const result = await Note.findNotes(searchTerm);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/notes/:id', requireAuth, async (req, res) => {
  const noteId = req.params.id;

  try {
    const result = await Note.getNote(noteId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/notes/:id', requireAuth, async (req, res) => {
  const noteId = req.params.id;
  const noteFields = req.body;

  try {
    const result = await Note.updateNote(noteId, noteFields);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.delete('/notes/:id', requireAuth, async (req, res) => {
  const noteId = req.params.id;

  try {
    const result = await Note.deleteNote(noteId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post('/tasks', requireAuth, async (req, res) => {
  const taskFields = req.body;

  try {
    const result = await Task.createTask(taskFields);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/tasks', requireAuth, async (req, res) => {
  try {
    const result = await Task.getTasks();
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/tasks/search', requireAuth, async (req, res) => {
  const { q: searchTerm } = req.query;

  try {
    const result = await Task.findTasks(searchTerm);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/tasks/:id', requireAuth, async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await Task.getTask(taskId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/tasks/:id', requireAuth, async (req, res) => {
  const taskId = req.params.id;
  const taskFields = req.body;

  try {
    const result = await Task.updateTask(taskId, taskFields);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.delete('/tasks/:id', requireAuth, async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await Task.deleteTask(taskId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

export default router;
