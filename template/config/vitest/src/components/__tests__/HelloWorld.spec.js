import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    // TODO: https://github.com/vuejs/vue-test-utils/issues/2087
    // @ts-ignore
    const wrapper = mount(HelloWorld, { propsData: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
