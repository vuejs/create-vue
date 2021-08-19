// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'You did it!')
  })

  it('navigates to the about page', () => {
    cy.visit('/about')
    cy.contains('h1', 'This is an about page')
  })
})
