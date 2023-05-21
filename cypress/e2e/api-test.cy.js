/* eslint-disable no-undef */
// globals
const companiesId = [];
const peopleId = [];

describe('Final Project: CRUD operations', () => {
  it('user creates a company', () => {
    cy.request({
      method: 'POST',
      // headers: { authorization: token },
      url: '/api/companies',
      body:
      {
        name: 'Goldman Sachs',
        webite: 'https://www.goldmansachs.com/',
        location: 'New York City, NY',
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
        webite: 'https://www.google.com/',
        description: 'I love big tech',
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
  it('user retrieves a company', () => {
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[0]}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.name).to.eq('Goldman Sachs');
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
        associatedCompany: companiesId[1],
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      peopleId.push(response.body.id ?? response.body._id);
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
      url: `/api/people/${peopleId[0]}`,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
    cy.request({
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/companies/${companiesId[2]}`,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.associatedPeople).to.not.include(peopleId[0]);
    });
  });
  it('user retrieves deleted person, expects to error code 404', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      // headers: { authorization: token },
      url: `/api/people/${peopleId[0]}`,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});
