import SingleDomainCrawler from "./crawler/Crawler";

const test = async () => {
  const crawler = new SingleDomainCrawler();

  await crawler.crawlFromURL({
    url: "https://www.reallinks.io/2020/07/16/the-psychology-behind-successful-referrals/",
  });

  setTimeout(() => {
    const scrapedInfo = crawler.getScrapedInfoFromUrls();
    console.log("urlsCrawled", JSON.stringify(scrapedInfo, undefined, 2));
  }, 5000);
};

test();
