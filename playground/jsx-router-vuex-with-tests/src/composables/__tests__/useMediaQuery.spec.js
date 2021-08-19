import { defineComponent, h, createVNode } from 'vue'
import { mount } from '@cypress/vue'

import useMediaQuery from '../useMediaQuery'

const Wrapper = defineComponent({
  props: {
    query: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const matches = useMediaQuery(props.query)
    return () => h('div', { id: 'result' }, matches.value.toString() )
  }
})

describe('useMediaQuery', () => {
  it('should correctly reflect the match result of a media query', () => {
    mount(Wrapper, {
      props: {
        query: '(min-width: 800px)'
      }
    })

    cy.viewport(1000, 660)
    cy.get('#result').should('include.text', 'true')

    cy.viewport(660, 660)
    cy.get('#result').should('include.text', 'false')
  })
})
