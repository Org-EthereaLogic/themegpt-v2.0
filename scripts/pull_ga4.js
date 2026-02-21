const { GoogleAuth } = require('google-auth-library');

function parseDateArg() {
  const input = process.argv[2];
  if (!input) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);
    console.log(`No date provided. Defaulting to prior day: ${dateStr}`);
    return dateStr;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    throw new Error('Date must be in YYYY-MM-DD format.');
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  if (input === todayStr) {
    console.warn(`WARNING: Pulling data for today (${todayStr}) is only a smoke check due to GA4 API lag. Reliable data requires pulling the prior day.`);
  }
  return input;
}

async function main() {
  const targetDate = parseDateArg();
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/analytics.readonly']
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const accessToken = typeof token === 'string' ? token : token?.token;
  if (!accessToken) {
    throw new Error('Unable to acquire Google access token.');
  }

  const propertyId = '516189580';
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'x-goog-user-project': 'gen-lang-client-0312336987'
  };

  const gate1Body = {
    dateRanges: [{ startDate: targetDate, endDate: targetDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'sessions' }]
  };

  const res1 = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(gate1Body)
  });

  if (!res1.ok) {
    console.error('Error fetching Gate 1:', await res1.text());
  } else {
    const data1 = await res1.json();
    console.log('--- GATE 1: Traffic Acquisition ---');
    console.log(JSON.stringify(data1, null, 2));
  }

  const gate3Body = {
    dateRanges: [{ startDate: targetDate, endDate: targetDate }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: {
          values: ['trial_start', 'checkout_start', 'purchase_success']
        }
      }
    }
  };

  const res3 = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(gate3Body)
  });

  if (!res3.ok) {
    console.error('Error fetching Gate 3:', await res3.text());
  } else {
    const data3 = await res3.json();
    console.log('--- GATE 3: Funnel Events ---');
    console.log(JSON.stringify(data3, null, 2));
  }
}

main().catch(console.error);
