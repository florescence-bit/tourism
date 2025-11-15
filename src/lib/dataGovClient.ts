export async function fetchDataGovResource(resourceId: string) {
  const key = process.env.NEXT_PUBLIC_DATAGOV_KEY;
  if (!key) throw new Error('Missing data.gov.in API key (set NEXT_PUBLIC_DATAGOV_KEY)');
  if (!resourceId) throw new Error('Missing resourceId (set NEXT_PUBLIC_DATAGOV_RESOURCE_ID)');

  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${key}&format=json&limit=1000`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`data.gov.in request failed: ${res.status} ${text}`);
  }
  const body = await res.json();
  // data.gov.in returns records in `records` key
  return body.records ?? [];
}
