export default interface ICrawler {
  crawlFromURL({
    url,
    pathToIgnore,
  }: {
    url: string;
    pathToIgnore?: string;
  }): void;
}
