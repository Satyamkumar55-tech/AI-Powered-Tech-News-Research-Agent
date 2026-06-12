export const fetchLatestReport = async () => {
  const url = 'https://satyam1421.app.n8n.cloud/webhook/latest-report';
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching report: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Parse both possible responses:
  // a) { "output": "..." }
  // b) [ { "output": "..." } ]
  
  if (Array.isArray(data)) {
    if (data.length > 0 && data[0].output) {
      return data[0].output;
    }
  } else if (data && data.output) {
    return data.output;
  }
  
  throw new Error("Invalid response format from webhook");
};
