import { Router } from 'express';
import { requireAuth, requireSignin } from './services/passport';
import * as Company from './controllers/company_controller';
import * as Person from './controllers/person_controller';
import * as Note from './controllers/note_controller';
import * as Task from './controllers/task_controller';
import * as User from './controllers/user_controller';
import * as Email from './controllers/email_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

router.post('/signin', requireSignin, async (req, res) => {
  try {
    console.log(req.user);
    const token = User.signin(req.user);
    res.json({ token, firstName: req.user.firstName, lastName: req.user.lastName, email: req.user.email });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const token = await User.signup(req.body);
    res.json({ token, firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/googleauth', requireAuth, async (req, res) => {
  const { code } = req.body;
  try {
    if (code) {
      await User.setGoogleAuth(req.user.id, code);
    }
    return res.json({ message: 'Google Auth Set' });
  } catch (error) {
    return res.status(422).send({ error: error.toString() });
  }
});

router.post('/companies', requireAuth, async (req, res) => {
  const companyFields = req.body;
  try {
    const result = await Company.createCompany(companyFields, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/companies', requireAuth, async (req, res) => {
  try {
    const result = await Company.getCompanies(req.query, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/companies/:id', requireAuth, async (req, res) => {
  const companyId = req.params.id;
  try {
    const result = await Company.getCompany(companyId, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/companies/:id', requireAuth, async (req, res) => {
  const companyId = req.params.id;
  const companyFields = req.body;

  try {
    const result = await Company.updateCompany(companyId, companyFields, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.delete('/companies/:id', requireAuth, async (req, res) => {
  const companyId = req.params.id;

  try {
    const result = await Company.deleteCompany(companyId, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post('/people', requireAuth, async (req, res) => {
  const personFields = req.body;
  try {
    const result = await Person.createPerson(personFields, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/people', requireAuth, async (req, res) => {
  const { q: query } = req.query;
  console.log(`query: ${query}`);
  try {
    const result = await Person.getPeople(req.query, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/people/:id', requireAuth, async (req, res) => {
  const personId = req.params.id;

  try {
    const result = await Person.getPerson(personId, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/people/:id', requireAuth, async (req, res) => {
  const personId = req.params.id;
  const personFields = req.body;

  try {
    const result = await Person.updatePerson(personId, personFields, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.delete('/people/:id', requireAuth, async (req, res) => {
  const personId = req.params.id;

  try {
    const result = await Person.deletePerson(personId, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post('/notes', requireAuth, async (req, res) => {
  const noteFields = req.body;

  try {
    const result = await Note.createNote(noteFields, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/notes', requireAuth, async (req, res) => {

  try {
    const result = await Note.getNotes(req.query, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/notes/:id', requireAuth, async (req, res) => {
  const noteId = req.params.id;

  try {
    const result = await Note.getNote(noteId, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/notes/:id', requireAuth, async (req, res) => {
  const noteId = req.params.id;
  const noteFields = req.body;

  try {
    const result = await Note.updateNote(noteId, noteFields, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.delete('/notes/:id', requireAuth, async (req, res) => {
  const noteId = req.params.id;

  try {
    const result = await Note.deleteNote(noteId, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post('/tasks', requireAuth, async (req, res) => {
  const taskFields = req.body;

  try {
    const result = await Task.createTask(taskFields, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/tasks', requireAuth, async (req, res) => {
  try {
    const result = await Task.getTasks(req.query, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/tasks/:id', requireAuth, async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await Task.getTask(taskId, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/tasks/:id', requireAuth, async (req, res) => {
  const taskId = req.params.id;
  const taskFields = req.body;

  try {
    const result = await Task.updateTask(taskId, taskFields, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.delete('/tasks/:id', requireAuth, async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await Task.deleteTask(taskId, req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get('/emails', requireAuth, async (req, res) => {
  try {
    const results = await Email.getEmails(req.query, req.user.id);
    return res.json(results);
  } catch (error) {
    return res.status(422).send({ error: error.toString() });
  }
});

export default router;
