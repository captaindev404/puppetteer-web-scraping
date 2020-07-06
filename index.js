const puppeteer = require("puppeteer");

const getJobDescription = async page => {
  await page.waitFor("#JobPreview");
  const result = await page.evaluate(() => {
    const description = document.querySelector("#JobDescription").innerText;
    const salaryElement = document.querySelector("#JobPreview .mux-job-cards");

    let salary = "";
    if (salaryElement && salaryElement.innerText) {
      salary = salaryElement.innerText;
    }

    return {
      description,
      salary
    };
  });
  return result;
};

(async () => {
  const browser = await puppeteer.launch({
    userDataDir: "./user_data",
    headless: false
    /// slowMo: 200,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1680, height: 920 });

  await page.goto("https://www.monster.fr", { waitUntil: "networkidle2" });

  const searchInput = await page.$("#q2");
  await searchInput.type("developpeur react");
  await page.waitFor(2000);

  await page.click("#doQuickSearch2");
  await page.waitFor(5000);
  const results = [];

  const jobs = await page.$$("h2.title > a");

  for (const job of jobs) {
    await job.click();
    await page.waitFor(2000);

    const jobDescription = await getJobDescription(page);
    const jobTitle = await page.evaluate(el => {
      if (el) {
        return el.innerText;
      }
      return "";
    }, job);

    if (jobDescription.salary === "") {
      continue;
    }
    results.push({
      title: jobTitle,
      salary: jobDescription.salary,
      url: await page.url(),
    });
  }
  console.table(results);

  await page.click('#loadMoreJobs');


  await page.waitFor(15000);
  await browser.close();
})();
