const CLASSIFIER_API = 'https://us-central1-browser-insights-d704b.cloudfunctions.net/getCategories';

export async function classifyURL(url : string) {
  try {
    const response = await fetch(CLASSIFIER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          "siteUrl": url
        }
      )
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Classification failed:', error);
    return null;
  }
}