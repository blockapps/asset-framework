import { assert } from 'chai'
import seleniumTester from '../seleniumTester'
import appTester from '../appTester';

const config = { timeout: 600000 };

describe('Home page - 1 browser', function () {
  this.timeout(config.timeout)
  let browsers

  beforeEach(async () => {
    browsers = await seleniumTester.createBrowsers(1)
  })

  it('test', async () => {
    const url = 'http://localhost'
    const app = await appTester.appUser(browsers[0], config.timeout)
    const data = await app.getHomePage(url);

    assert.equal(data.title, "Hola!")
    assert.isObject(JSON.parse(data.health), "should be true")
  })

  afterEach(async () => {
    await seleniumTester.destroyBrowsers(browsers)
  })
})
