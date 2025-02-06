describe('App', function () {
  before((browser) => {
    browser.init()
  })

  it('mounts and renders properly', async function () {
    const appComponent = await browser.mountComponent('/src/App.vue');

    browser.expect.element(appComponent).to.be.present;
    browser.expect.element('h1').text.to.contain('You did it!');
  })

  after((browser) => browser.end())
})
