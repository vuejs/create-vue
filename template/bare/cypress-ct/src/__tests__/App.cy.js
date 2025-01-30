import App from '../App.vue'

describe('App', () => {
  it('mounts and renders properly', () => {
    cy.mount(App)
    cy.get('h1').should('contain', 'You did it!')
  })
})
