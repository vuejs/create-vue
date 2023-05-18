import { expect, test } from '@playwright/experimental-ct-vue'
import HelloWorld from '../HelloWorld.vue'


test('playground', async ({ mount }) => {
  await mount(HelloWorld, {
    props: { msg: 'Hello Playwright' }
  })
})

test('renders properly', async ({ mount }) => {
  const component = await mount(HelloWorld, {
    props: { msg: 'Hello Playwright' }
  })
  await expect(component.getByRole('heading', { level: 1 })).toContainText('Hello Playwright')
})
