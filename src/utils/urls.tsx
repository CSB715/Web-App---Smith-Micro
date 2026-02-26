export function getDisplayUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
}
