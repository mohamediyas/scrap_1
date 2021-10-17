const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Listing = require("./model/Listing");

async function connectToMongoDB() {
  await mongoose.connect();

  console.log("connected to db");
}

async function scrapListings(page) {
  await page.goto(
    "https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof"
  );

  const html = await page.content();

  const $ = await cheerio.load(html);

  //   $(".result-title").each((index, element) => {
  //     console.log($(element).text());
  //   });

  //   $(".result-title").each((index, element) => {
  //     console.log($(element).attr("href"));
  //   });

  const results = $(".result-info")
    .map((index, element) => {
      const titleElement = $(element).find(".result-title");

      const timeElement = $(element).find(".result-date");

      const hoodElements = $(element).find(".result-hood");

      const title = $(titleElement).text();

      const url = $(titleElement).attr("href");

      const datePosted = new Date($(timeElement).attr("datetime"));

      const hood = $(hoodElements)
        .text()
        .trim()
        .replace("(", "")
        .replace(")", "");

      return {
        title,
        url,
        datePosted,
        hood,
      };
    })
    .get();
  console.log(results);

  return results;
}

async function scrapJobDescription(listing, page) {
  for (let i = 0; i < listing.length; i++) {
    await page.goto(listing[i].url);

    const html = await page.content();

    const $ = cheerio.load(html);

    const jobDescription = $("#postingbody").text();

    const compensation = $("p.attrgroup > span:nth-child(1) > b").text();

    listing[i].jobDescription = jobDescription;

    listing[i].compensation = compensation;

    console.log(listing);

    const listingModel = new Listing(listing[i]);

    await listingModel.save();

    await sleep(1000);
  }
}

async function sleep(millisecond) {
  return new Promise((resolve) => setTimeout(resolve, millisecond));
}

async function main() {
  await connectToMongoDB();
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  const listing = await scrapListings(page);
  const listingwithJobDescription = await scrapJobDescription(listing, page);
}

main();
