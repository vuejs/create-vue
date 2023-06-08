describe('My First Test', function () {
  before((browser) => {
    browser.init()
  })

  it('visits the app root url', function () {
    browser.assert
      .textContains('.green', 'You did it!')
      .assert.elementHasCount('.wrapper nav a', 2)
      .strictClick('.wrapper nav a:last-child')
  })

  after((browser) => browser.end())
})
