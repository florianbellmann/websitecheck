const dotenv = require("dotenv");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path")
const date = require("date-and-time")
const dateHelper = require("./date.helper")
const { exec } = require("child_process");

dotenv.config();
const pixelThreshold = process.env.PIXEL_THRESHOLD || 1000
const resultLocation = process.env.RESULT_LOCATION || "results"

process.setMaxListeners(0)

function nodeLog(message) {
  const now = new Date();
  console.log("[" + date.format(now, 'YYYY-MM-DD HH:mm:ss') + "] " + message)
}

function getSites() {
  return JSON.parse(fs.readFileSync("sites.json")).sites;
}

function getDateString(date) {
  return date.getFullYear() + "_" + (date.getMonth() + 1) + "_" + date.getDate()
}

function getValidDates(today) {
  const yesterday = dateHelper.getDayBefore(today)
  const twodaysago = dateHelper.getDayBefore(yesterday)
  const threedaysago = dateHelper.getDayBefore(twodaysago)
  const dates = [
    today, yesterday, twodaysago, threedaysago
  ]
  return [
    getDateString(today),
    getDateString(yesterday),
    getDateString(twodaysago),
    getDateString(threedaysago),
  ]
}

function cleanUpOldResults(today) {
  const resultDirectories = fs.readdirSync(path.join(resultLocation))

  resultDirectories.forEach(element => {
    if (validDates.indexOf(element) < 0) {
      try {
        nodeLog("Removing: " + element)
        fs.rmdirSync(path.join(resultLocation, element), { recursive: true })
      } catch (error) {
        console.error(error)
      }
    }
  })
}

function prepareResults() {
  nodeLog("Preparing results.")
  const dateString = getDateString(today)
  const resultDir = path.join(resultLocation, dateString)

  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
  }

  cleanUpOldResults(today)

  nodeLog("Finished preparing results.")
  return resultDir
}

async function compareImages(sites) {
  return new Promise(async (resolve, reject) => {
    nodeLog("Comparing images.")
    const promises = []

    sites.forEach(site => {
      promises.push(compareImage(site.name, validDates[0], validDates[1]))
    })

    Promise.all(promises).then(results => {
      const sitesWithChanges = results.filter(result => result !== null)
      nodeLog("Finished comparing images.")
      resolve(sitesWithChanges)
    }).catch(err => {
      console.error(err)
      reject(err)
    })
  })
}

async function compareImage(siteName, dateString1, dateString2) {
  return new Promise(async (resolve) => {
    const pixelDifference = await getPixelDifference(siteName, dateString1, dateString2)
    if (pixelDifference > pixelThreshold) {
      nodeLog("Difference detected for " + siteName + " , pixel difference is " + pixelDifference)
      resolve(siteName)
    }
    else {
      nodeLog("No Difference on " + siteName)
      resolve(null)
    }
  })
}

async function getPixelDifference(siteName, dateString1, dateString2) {
  return new Promise((resolve, reject) => {
    var pixelDifference = -1
    const executable = process.platform === "darwin" ? "imgdiff-darwin-amd64" : "imgdiff-linux-386"

    const image1 = path.join(resultLocation, dateString1, siteName + ".png")
    const image2 = path.join(resultLocation, dateString2, siteName + ".png")

      const fullCommand ="./imgdiff/" + executable + " " + image1 + " " + image2
          nodeLog(fullCommand)
    exec( fullCommand,(outerError, stdout, stderr) => {
      if (outerError) {
        try {
          // wtf
          const pixels = parseInt(stdout.split("Different pixels:")[1].replace("[1;31m", "").toString().replace("", "").split("[")[0].replace("", "").replace("", "").trim().trim() + "")
          pixelDifference = pixels
          resolve(pixelDifference)
        } catch (innerError) {
          if (stderr.indexOf("no such file") > 0) {
            nodeLog("There was no file to compare for " + siteName)
          }
          else {
            console.error("Could not parse pixel difference.", stdout, innerError, outerError)
          }
          resolve(pixelDifference)
          return;
        }
      }
      if (stdout) {
        pixelDifference = 0
        resolve(pixelDifference)
        return;
      }
    });

  })
}

function handleResults(results) {
  nodeLog("Handling results.")
  nodeLog("Changes on: " + results)
  nodeLog(results.length)
}

async function snapSites(sites, resultDir) {
  nodeLog("Starting to query sites")
  sites.forEach(async (site) => {
    nodeLog("Querying: " + site.name);
    const browser = process.platform !== "darwin" ? await puppeteer.launch({ executablePath: "chromium-browser" }) : await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(site.url);
    await page.screenshot({ path: path.join(resultDir, site.name + ".png") });

    await browser.close();
  });
  nodeLog("Finished querying sites.")
}

const today = new Date()
const validDates = getValidDates(today);

(async () => {
  const sites = getSites()
  // nodeLog(sites);

  const resultDir = prepareResults()
    await snapSites(sites, resultDir)
  if (!fs.existsSync(path.join(resultLocation, getDateString(dateHelper.getDayBefore(today))))) {
    nodeLog("No results from yesterday. Nothing to compare.")
  }
  else {

    const results = await compareImages(sites)

    handleResults(results)
  }
    return 
})();
