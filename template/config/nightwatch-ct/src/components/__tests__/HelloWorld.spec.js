describe('Hello World', function () {
  before((browser) => {
    browser.init()
  })

  it('renders properly', async function () {
    const welcomeComponent = await browser.mountComponent('/src/components/HelloWorld.vue', {props: {msg: 'Hello Nightwatch'}});

    browser.expect.element(welcomeComponent).to.be.present;
    browser.expect.element('h1').text.to.contain('Hello Nightwatch');
  })

  after((browser) => browser.end())
})
