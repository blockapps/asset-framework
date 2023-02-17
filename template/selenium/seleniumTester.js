import { Capabilities, Builder, By, until } from 'selenium-webdriver'

const buildChrome = () => {
  const chromeCapabilities = Capabilities.chrome()
  // setting chrome options to start the browser fully maximized
  const chromeOptions = {
    args: [
      '--test-type',
      '--start-maximized',
      '--incognito',
    ],
  }
  chromeCapabilities.set('chromeOptions', chromeOptions)
  const driver = new Builder().withCapabilities(chromeCapabilities).build()
  return driver
}

// util
function log(id, prompt, ...args) {
  if (true) {
    console.log(`### (${id}) ${prompt}`, ...args)
  }
}

async function sleep(driver, timeout, prompt = '') {
  log(driver.id, 'sleep', prompt, timeout)
  await driver.sleep(timeout)
  log(driver.id, 'sleep', prompt, timeout, 'done')
}

// wait
async function waitByName(driver, name, timeout) {
  log(driver.id, 'waitByName', { name, timeout })
  return driver.wait(until.elementLocated(By.name(name)), timeout)
}

async function waitByLinkText(driver, linkText, timeout = 5000) {
  log(driver.id, 'waitByLinkText', { linkText, timeout })
  return driver.wait(until.elementLocated(By.linkText(linkText)), timeout)
}

async function waitByXpath(driver, xpath, timeout) {
  log(driver.id, 'waitByXpath', { xpath, timeout })
  return driver.wait(until.elementLocated(By.xpath(xpath)), timeout)
}

async function waitById(driver, id, timeout) {
  log(driver.id, 'waitById', { id, timeout })
  return driver.wait(until.elementLocated(By.id(id)), timeout)
}

async function waitByClassName(driver, className, timeout = 5000) {
  log(driver.id, 'waitByClassName', { className, timeout })
  return driver.wait(until.elementLocated(By.className(className)), timeout)
}

const untilClickableByName = (name) => (driver) => driver.findElement(By.name(name)).then((element) => element.click().then(() => true, () => false), () => false)

// click
async function click(driver, name, timeout) {
  log(driver.id, 'click', { name, timeout })
  driver.wait(untilClickableByName(name), timeout, `Timeout waiting for element - ${name}`)
  await driver.sleep(500)
}


async function clickById(driver, id, timeout) {
  log(driver.id, 'clickById', { id, timeout })
  const element = await waitById(driver, id, timeout)
  await element.click()
}

async function clickByLinkText(driver, linkText, timeout) {
  log(driver.id, 'clickByLinkText', { linkText, timeout })
  const element = await waitByLinkText(driver, linkText, timeout)
  await element.click()
  await driver.sleep(500)
}

async function clickByXPath(driver, xpath, timeout) {
  log(driver.id, 'clickByXPath', { xpath, timeout })
  const element = await waitByXpath(driver, xpath, timeout)
  await element.click()
  await driver.sleep(500)
}

// drop down menu
async function dropDown(driver, name, linkText, timeout) {
  log(driver.id, 'dropDown', { name, linkText, timeout })

  // try/catch because element is removed and re added to the dom after is enabled
  try {
    const element = await waitByName(driver, name, timeout)
    await driver.wait(until.elementIsEnabled(element), timeout)
  } catch (error) {
    const element = await waitByName(driver, name, timeout)
    await driver.wait(until.elementIsEnabled(element), timeout)
  }

  await click(driver, name, timeout)
  await clickById(driver, linkText, timeout)
}

// type text
async function sendKeys(driver, name, keys, timeout) {
  log(driver.id, 'sendKeys', { name, keys, timeout })
  const element = await waitByName(driver, name, timeout)
  await element.sendKeys(...keys)
}

async function sendKeysUsingId(driver, name, keys, timeout) {
  log(driver.id, 'sendKeysUsingId', { name, keys, timeout })
  const element = await waitById(driver, name, timeout)
  await element.sendKeys(...keys)
}

async function sendKeysUsingXpath(driver, name, keys, timeout) {
  log(driver.id, 'sendKeysUsingXpath', { name, keys, timeout })
  const element = await waitByXpath(driver, name, timeout)
  await element.sendKeys(...keys)
}

async function sendKeysAction(driver, keys) {
  log(driver.id, 'sendKeyAction', { keys })
  const actions = driver.actions({ bridge: true })
  await actions.sendKeys(...keys).perform()
}

// wait for element to be removed
async function waitOffScreen(driver, name, timeout = 5000) {
  log(driver.id, 'waitOffScreen', { name, timeout })
  const startTime = new Date().getTime()

  await driver.wait(async () => {
    log(driver.id, 'waitOffScreen', (new Date().getTime()))
    try {
      await driver.findElement(By.name(name))
      // found - sleep and retry
      await driver.sleep(1000)
      return false
    } catch (err) {
      const endTime = new Date().getTime()
      log(driver.id, 'waitOffScreen: elapsed', (endTime - startTime) / 1000)
      // removed - wait is over
      if (err.name == 'NoSuchElementError') return true
      // another error - fail
      throw err
    }
  }, timeout)
}

async function refresh(driver) {
  await driver.navigate().refresh()
}

async function isElementAvailable(driver, name, timeout) {
  try {
    await waitByName(driver, name, timeout)
    return true
  } catch (err) {
    // if timed out - element is not visible else - throw
    if (err.name !== 'TimeoutError') {
      throw err
    }
  }
  return false
}

const createBrowser = (id) => {
  const driver = buildChrome()
  driver.id = id
  const browser = {
    id,
    driver,
    click: (name, timeout) => click(driver, name, timeout),
    clickById: (id, timeout) => clickById(driver, id, timeout),
    clickByLinkText: (linkText, timeout) => clickByLinkText(driver, linkText, timeout),
    clickByXPath: (xpath, timeout) => clickByXPath(driver, xpath, timeout),
    dropDown: (name, linkText, timeout) => dropDown(driver, name, linkText, timeout),
    get: (url, ...args) => driver.get(url, ...args),
    isElementAvailable: (name, timeout) => isElementAvailable(driver, name, timeout),
    log: (prompt, ...args) => log(id, prompt, ...args),
    refresh: () => refresh(driver),
    sendKeys: (name, keys, timeout) => sendKeys(driver, name, keys, timeout),
    sendKeysAction: (keys) => sendKeysAction(driver, keys),
    sendKeysUsingId: (name, keys, timeout) => sendKeysUsingId(driver, name, keys, timeout),
    sendKeysUsingXpath: (name, keys, timeout) => sendKeysUsingXpath(driver, name, keys, timeout),
    sleep: (timeout, prompt) => sleep(driver, timeout, prompt),
    waitByClassName: (className, timeout) => waitByClassName(driver, className, timeout),
    waitById: (id, timeout) => waitById(driver, id, timeout),
    waitByLinkText: (linkText, timeout) => waitByLinkText(driver, linkText, timeout),
    waitByName: (name, timeout) => waitByName(driver, name, timeout),
    waitByXpath: (xpath, timeout) => waitByXpath(driver, xpath, timeout),
    waitOffScreen: (name, timeout) => waitOffScreen(driver, name, timeout),
  }
  return browser
}

const createBrowsers = (count) => {
  const countMap = Array.from(Array(count).keys())
  const browsers = countMap.map((index) => createBrowser(index))
  return browsers
}

const destroyBrowsers = async (browsers) => {
  for (let i = 0; i < browsers.length; i++) {
    const browser = browsers[i]
    log(browser.id, 'destroy browser', browser.id)
    // MUST sleep before the first one AND between browsers
    await browser.driver.sleep(1000)
    await browser.driver.close()
  }
}

export default {
  createBrowser,
  createBrowsers,
  destroyBrowsers,
}
