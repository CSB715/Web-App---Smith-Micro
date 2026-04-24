export function getDisplayUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
}

export function trimUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/^www\./, "").replace(/\/.*$/, "");
}
