async function getHomePage(browser, url, timeout) {
  await browser.get(url)
  await browser.waitByName('app', timeout)

  const health = await browser.waitByName('health-status', timeout);
  const title = await browser.waitByName('title', timeout);

  return {
    health: await health.getText(),
    title:await title.getText(),
  };
}

const appUser = (browser) => ({
  getHomePage: (url, timeout) => getHomePage(browser, url, timeout),
})


export default {
  appUser,
}
