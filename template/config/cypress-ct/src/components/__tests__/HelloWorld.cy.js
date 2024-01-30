import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('playground', () => {
    // TODO: https://github.com/cypress-io/cypress/pull/28818
    // @ts-ignore
    cy.mount(HelloWorld, { propsData: { msg: 'Hello Cypress' } })
  })

  it('renders properly', () => {
    // TODO: https://github.com/cypress-io/cypress/pull/28818
    // @ts-ignore
    cy.mount(HelloWorld, { propsData: { msg: 'Hello Cypress' } })
    cy.get('h1').should('contain', 'Hello Cypress')
  })
})
