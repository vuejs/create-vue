const waitOn = require('wait-on')
const { spawn } = require('child_process')

let serverPid = null
const serverPort = process.env.CI ? '4173' : '5173'

module.exports = {
  before(done) {
    const commandType = process.env.CI ? 'preview' : 'dev'
    serverPid = spawn('npm', ['run', commandType, '--', '--host'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    }).pid

    waitOn({
      resources: [`http-get://localhost:${serverPort}`],
      verbose: true,
      headers: {
        accept: 'text/html'
      }
    }).then(() => {
      done()
    })
  },

  after() {
    if (serverPid) {
      process.kill(serverPid)
    }
  }
}
