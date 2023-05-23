/* eslint-disable no-undef */

// globals
const companiesId = [];
const peopleId = [];
let noteId;
let taskId;
let deadNoteId;
let deadTaskId;
let token;

// Goldman is companiesId[0], Google is companiesId[1], Microsoft is companiesId[2]
// Jason Doh is peopleId[0], after updating he is assocated with Microsoft companiesId[2] and not Google
// Brian is peopleId[1], he is associated with Google companyId[1]

const getUniqueId = () => { return Cypress._.uniqueId(Date.now().toString()); };
const email = `${getUniqueId()}@test.com`;

describe('Authentication', () => {
  it('user signs up with email and password', () => {
    cy.request(
      'POST',
      '/api/signup',
      { email, password: 'password' },
    ).then((response) => {
      expect(response.status).to.eq(200);
      token = response.body.token;
    });
  });
  it('same user signs up with email and password, expecting fail 422', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: '/api/signup',
      body: { email, password: 'password' },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });
  it('user signs in with email and password', () => {
    cy.request({
      method: 'POST',
      url: '/api/signin',
      body: { email, password: 'password' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      token = response.body.token;
    });
  });
});

describe('Final Project: CRUD operations', () => {
  // TESTING FOR COMPANY API
  it('user creates a company', () => {
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/companies',
      body:
      {
        name: 'Goldman Sachs',
        website: 'https://www.goldmansachs.com/',
        linkedin: 'https://www.linkedin.com/company/goldman-sachs/',
        description: 'I love big banks',
        location: 'New York City, NY',
        tags: ['finance', 'banking', 'investment'],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      companiesId.push(response.body.id ?? response.body._id);
    });
    // Creates second company to validate other tests and for other testing purposes
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/companies',
      body:
      {
        name: 'Google',
        website: 'https://www.google.com/',
        description: 'I love big tech',
        location: 'Mountain View, CA',
        tags: ['tech', 'search', 'advertising'],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      companiesId.push(response.body.id ?? response.body._id);
    });
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/companies',
      body:
      {
        name: 'Microsoft',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      companiesId.push(response.body.id ?? response.body._id);
    });
  });
  it('user creates a bad company without name', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/companies',
      body:
      {
        website: 'https://www.goldmansachs.com/',
        location: 'New York City, NY',
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user creates a bad company with wrong type for title', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/companies',
      body:
      {
        title: 1234,
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user retrieves a company', () => {
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.name).to.eq('Goldman Sachs');
      expect(response.body.website).to.eq('https://www.goldmansachs.com/');
      expect(response.body.linkedin).to.eq('https://www.linkedin.com/company/goldman-sachs/');
      expect(response.body.description).to.eq('I love big banks');
      expect(response.body.location).to.eq('New York City, NY');
      expect(response.body.tags).to.deep.eq(['finance', 'banking', 'investment']);
    });
  });
  it('user retrieves a bad company id, expecting failure code 404', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: '/api/companies/foobar',
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user updates a company', () => {
    cy.request({
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[0]}`,
      body:
      {
        linkedin: 'https://www.linkedin.com/company/goldman-sachs/',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.linkedin).to.eq('https://www.linkedin.com/company/goldman-sachs/');
    });
  });
  it('user deletes a company', () => {
    cy.request({
      method: 'DELETE',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
  it('retrieving deleted company, expecting error code 404', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[0]}`,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  // TESTING FOR PEOPLE API
  it('user creates a person', () => {
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/people',
      body:
      {
        name: 'Jason Doh',
        location: 'Menlo Park, CA',
        title: 'Software Engineer',
        description: 'I am a software engineer',
        linkedin: 'https://www.linkedin.com/in/jasondoh/',
        associatedCompany: companiesId[1],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      peopleId.push(response.body.id ?? response.body._id);
    });
    // Creates 2nd person for future testing purposes
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/people',
      body:
      {
        name: 'Brain Dong',
        associatedCompany: companiesId[1],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      peopleId.push(response.body.id ?? response.body._id);
    });
    // Creates 3rd person for deleting testing purposes
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/people',
      body:
      {
        name: 'I am going to be deleted help',
        associatedCompany: companiesId[2],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      peopleId.push(response.body.id ?? response.body._id);
    });
  });
  it('user creates a bad person without name', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/people',
      body:
      {
        location: 'New York City, NY',
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user creates a person with a nonexistent company', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/people',
      body:
      {
        name: 'GigaBin',
        associatedCompany: companiesId[0],
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user retrieves a person', () => {
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.name).to.eq('Jason Doh');
      expect(response.body.location).to.eq('Menlo Park, CA');
      expect(response.body.title).to.eq('Software Engineer');
      expect(response.body.description).to.eq('I am a software engineer');
      expect(response.body.linkedin).to.eq('https://www.linkedin.com/in/jasondoh/');
    });
  });
  it('user retrieves a bad person id, expecting failure code 404', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: '/api/people/foobar',
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user updates a person', () => {
    cy.request({
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
      body:
      {
        linkedin: 'https://www.linkedin.com/in/jason-doh',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.linkedin).to.eq('https://www.linkedin.com/in/jason-doh');
    });
  });
  it('user updates a person\'s associated company', () => {
    cy.request({
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
      body:
      {
        associatedCompany: companiesId[2],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.linkedin).to.eq('https://www.linkedin.com/in/jason-doh');
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.associatedPeople).to.include(peopleId[0]);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.associatedPeople).to.not.include(peopleId[0]);
    });
  });
  it('user updates a person\'s associated company with bad ID', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
      body:
      {
        associatedCompany: 'RAWR',
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user deletes person, expects to delete from associatedCompany too', () => {
    cy.request({
      method: 'DELETE',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[2]}`,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.associatedPeople).to.not.include(peopleId[2]);
    });
  });
  it('user retrieves deleted person, expects to error code 404', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[2]}`,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  // TESTING FOR NOTES API
  it('user creates a note', () => {
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/notes',
      body:
      {
        title: 'Call Note for Jason Doh - 5/21/2023',
        content: 'This is a note about Jason Doh',
        associatedPerson: peopleId[0],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      noteId = response.body.id ?? response.body._id;
    });
  });
  it('user creates a bad note, no title', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/notes',
      body:
      {
        content: 'I am a bad bad note',
        associatedPerson: peopleId[0],
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user creates a bad note, mismatched associatedPerson and company', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/notes',
      body:
      {
        title: 'Call Note for Jason Doh - 5/21/2023',
        content: 'This is a note about Jason Doh',
        associatedPerson: peopleId[0],
        associatedCompany: companiesId[1],
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user retrieves a note', () => {
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/notes/${noteId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.title).to.eq('Call Note for Jason Doh - 5/21/2023');
      expect(response.body.associatedCompany).to.eq(companiesId[2]);
    });
  });
  it('user retrieves a bad note, expects error 404', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: '/api/notes/BADID',
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user updates note with new person', () => {
    cy.request({
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/notes/${noteId}`,
      body:
      {
        title: 'Call Note for Brian Dong - 5/21/2023',
        content: 'This is a updated note about Brian Dong',
        associatedPerson: peopleId[1],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.associatedPerson).to.eq(peopleId[1]);
      expect(response.body.associatedCompany).to.eq(companiesId[1]);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.include(noteId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.not.include(noteId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.include(noteId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.not.include(noteId);
    });
  });
  it('user updates bad notes with new person, expected 404 because company person mismatch', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/notes/${taskId}`,
      body:
      {
        title: 'Bad Call Note for Brian Dong - 5/21/2023',
        associatedCompany: companiesId[2],
        associatedPerson: peopleId[1],
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.include(noteId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.not.include(noteId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.include(noteId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.not.include(noteId);
    });
  });
  it('user updates note with new company, expected 404 tied to person', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/notes/${noteId}`,
      body:
      {
        associatedCompany: companiesId[2],
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.include(noteId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.not.include(noteId);
    });
  });
  it('user deletes note', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      // headers: { authorization: token },
      url: `/api/notes/${noteId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.not.include(noteId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.notes).to.not.include(noteId);
    });
  });
  it('user retrieves deleted note, expects to error code 404', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/notes/${noteId}`,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  // TESTING FOR TASKS API
  it('user creates a tasks', () => {
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/tasks',
      body:
      {
        title: 'Follow Up Networking Email with Jason Doh',
        description: 'This is a task about Jason Doh',
        tags: ['Networking', 'Follow Up'],
        dueDate: '2023-05-22T00:00:00.000Z',
        associatedPerson: peopleId[0],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      taskId = response.body.id ?? response.body._id;
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.include(taskId);
    });
  });
  it('user retrieves a task', () => {
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/tasks/${taskId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.title).to.eq('Follow Up Networking Email with Jason Doh');
      expect(response.body.description).to.eq('This is a task about Jason Doh');
      expect(response.body.tags).to.eql(['Networking', 'Follow Up']);
      expect(response.body.dueDate).to.eq('2023-05-22T00:00:00.000Z');
      expect(response.body.associatedPerson).to.eq(peopleId[0]);
      expect(response.body.associatedCompany).to.eq(companiesId[2]);
    });
  });
  it('user creates a bad task, expected error 404 because no title', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/tasks',
      body:
      {
        description: 'This is a task about Jason Doh',
        tags: ['Networking', 'Follow Up'],
        dueDate: '2023-05-22T00:00:00.000Z',
        associatedPerson: peopleId[0],
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.length(1);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.length(1);
    });
  });
  it('user creates a bad task, expected error 404 with wrong associationID', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/tasks',
      body:
      {
        title: 'Hi I\'m a task',
        associatedPerson: 'meow',
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/tasks',
      body:
      {
        title: 'Hi I\'m also a bad task',
        associatedCompany: 'meow',
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
  it('user updates task with new person', () => {
    cy.request({
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/tasks/${taskId}`,
      body:
      {
        title: 'This is an updated task for Brian Dong',
        description: 'Call Brian',
        associatedPerson: peopleId[1],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.associatedPerson).to.eq(peopleId[1]);
      expect(response.body.associatedCompany).to.eq(companiesId[1]);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.not.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.not.include(taskId);
    });
  });
  it('user updates bad task with new person, expected 404 because company person mismatch', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/tasks/${taskId}`,
      body:
      {
        title: 'This is an bad updated task for Brian Dong',
        description: 'Call Brian',
        associatedCompany: companiesId[2],
        associatedPerson: peopleId[1],
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.not.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.not.include(taskId);
    });
  });
  it('user updates task with new company, expected 404 because tied to person', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      // headers: { authorization: token },
      url: `/api/tasks/${taskId}`,
      body:
      {
        associatedCompany: companiesId[2],
      },
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.not.include(taskId);
    });
  });
  it('user deletes task', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      // headers: { authorization: token },
      url: `/api/tasks/${taskId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.not.include(taskId);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[1]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.tasks).to.not.include(taskId);
    });
  });
  it('user retrieves deleted task, expects to error code 404', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/tasks/${taskId}`,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  // DELETION TESTS, HAVE TO FIX, OK TO FAIL
  it('user deletes company, expected for person and people associated tasks/notes to remain, only company associated notes/tasks to delete', () => {
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/tasks',
      body:
      {
        title: 'Follow Up x3 Networking Email with Jason Doh',
        associatedPerson: peopleId[0],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.associatedPerson).to.eq(peopleId[0]);
      taskId = response.body.id ?? response.body._id;
    });

    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/tasks',
      body:
      {
        title: 'Recruit for Microsoft',
        associatedCompany: companiesId[2],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.associatedCompany).to.eq(companiesId[2]);
      deadTaskId = response.body.id ?? response.body._id;
    });

    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/notes',
      body:
      {
        title: 'Note about Jason Doh at Microsoft',
        associatedPerson: peopleId[0],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.associatedPerson).to.eq(peopleId[0]);
      noteId = response.body.id ?? response.body._id;
    });

    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/notes',
      body:
      {
        title: 'Note about Microsoft',
        associatedCompany: companiesId[2],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.associatedCompany).to.eq(companiesId[2]);
      // expect(response.body.id).to.eq("MOW");
      deadNoteId = response.body.id ?? response.body._id;
      expect(response.body.id).to.eq(deadNoteId);
    });

    cy.request({
      method: 'DELETE',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/notes/${deadNoteId}`,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });

    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/tasks/${deadTaskId}`,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });

    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/notes/${noteId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/tasks/${taskId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
