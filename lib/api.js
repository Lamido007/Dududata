const API_BASE = 'https://alrahuzdata.com.ng/api/';
const TOKEN = process.env.ALRAHUZ_TOKEN || '66f2e5c39ac8640f13cd888f161385b12f7e5e92';

const headers = {
  'Authorization': `Token ${TOKEN}`,
  'Content-Type': 'application/json'
};

const NETWORK_IDS = { MTN: 1, Glo: 2, Airtel: 3, '9mobile': 4 };

const PLAN_IDS = {
  data: {
    MTN: { '1GB': 101, '2GB': 102, '5GB': 105 },
    Glo: { '1GB': 201, '2GB': 202 },
    // Add more plans from Alrahuz dashboard
  },
  electricity: { 'IKEJA ELECTRIC (IKEDC)': 1, 'EKO ELECTRIC (EKEDC)': 2 },
  cable: { DSTV: 1, GOTV: 2, Startimes: 3 },
  betting: { Bet9ja: 1, Sportybet: 2 },
  exam: { 'WAEC PIN': 1, 'NECO PIN': 2, 'JAMB ePIN': 3 }
};

export async function callAlrahuz(endpoint, body) {
  try {
    const response = await fetch(`\( {API_BASE} \){endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    if (data.status === 'success') return { success: true, data };
    else throw new Error(data.message || 'Failed');
  } catch (error) {
    console.error('Alrahuz API Error:', error);
    return { success: false, error: error.message };
  }
}

export { NETWORK_IDS, PLAN_IDS };
