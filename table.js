const request = require("request-promise");

const cheerio = require("cheerio");

async function main() {
  const result = await request.get(
    "https://www.codingwithstefan.com/table-example/"
  );

  const $ = await cheerio.load(result);

  $("body > table > tbody > tr").each((index, element) => {
    const tds = $(element).find("td");

    const company = $(tds[0]).text();
    const contact = $(tds[1]).text();
    const country = $(tds[2]).text();

    console.log({ company, contact, country });
  });
}

main();
