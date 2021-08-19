import { mount } from '@cypress/vue'

import ColorSchemeSwitch from '../ColorSchemeSwitch.vue'

describe('ColorSchemeSwitch', () => {
  beforeEach(() => {
    cy.stub(window, 'matchMedia')
      .withArgs('(prefers-color-scheme: light)')
      .returns({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      })
      .withArgs('(prefers-color-scheme: dark)')
      .returns({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      })
  })

  it('use the preferred color scheme by default', () => {
    mount(ColorSchemeSwitch)

    cy.get('body').should('have.attr', 'data-color-scheme', 'dark')
  })

  it('toggles the color scheme affter user clicks toggle', () => {
    mount(ColorSchemeSwitch)

    cy.get('.color-scheme-switch').click()
    cy.get('body').should('have.attr', 'data-color-scheme', 'light')
  })
})
