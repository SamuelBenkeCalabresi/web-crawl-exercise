import * as cheerio from "cheerio";
import axios, { AxiosError } from "axios";
import { parseToUrl } from "../utils";
import ICrawler from "./ICrawler";

interface ScrapedInfo {
  title: string;
  description?: string;
}

/* Crawls only links of the initial URL domain */
export default class SingleDomainCrawler implements ICrawler {
  private urlsCrawled: { [key: string]: boolean } = {};
  private scrapedInfoFromUrls: { [key: string]: ScrapedInfo } = {};

  async crawlFromURL({
    url,
    pathToIgnore,
  }: {
    url: string;
    pathToIgnore?: string;
  }): Promise<void> {
    if (this.urlsCrawled[url]) return;

    console.log("Crawl from URL:", url);

    this.urlsCrawled[url] = true;

    const { host, protocol } = new URL(url);

    if (!host || !protocol) {
      throw new Error("No host or protocol found");
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "axios 0.21.1",
        },
      });
      if (!response) {
        throw new Error("No response from URL requested.");
      }
      const { data: html } = response;
      const $ = cheerio.load(html);

      const title = $("title").text();
      const description = $("meta[name=description]").attr("content");

      const scrapedInfo: ScrapedInfo = {
        title,
        description,
      };

      this.scrapedInfoFromUrls[url] = scrapedInfo;

      const links = $("a")
        .map((i, link) => link.attribs.href)
        .get();

      links
        .filter((link) => link.includes(host))
        .forEach((link) => {
          this.crawlFromURL({
            url: parseToUrl(link, host, protocol),
            pathToIgnore,
          });
        });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log(
        `Error requesting URL ${url} with axios error status: ${axiosError.response?.status} with error status details: ${axiosError.response?.statusText}`
      );
    }
  }

  getScrapedInfoFromUrls() {
    return this.scrapedInfoFromUrls;
  }
}
