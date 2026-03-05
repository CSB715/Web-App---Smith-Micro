const CLASSIFIER_API = 'https://url-classifier-1061503587334.us-central1.run.app/classify';

export async function classifyURL(url : string) {
  try {
    const response = await fetch(CLASSIFIER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const result = await response.json();
    console.log(`${url} -> ${result.category} (${(result.confidence * 100).toFixed(1)}%)`);
    return result;
  } catch (error) {
    console.error('Classification failed:', error);
    return null;
  }
}