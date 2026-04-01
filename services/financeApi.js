const FINANCE_CACHE = { data: null, timestamp: 0 };
const CACHE_DURATION = 30 * 60 * 1000; // 30 dakika

async function getExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return {
      USD_TRY: data.rates.TRY,
      EUR_TRY: data.rates.TRY / data.rates.EUR,
      GBP_TRY: data.rates.TRY / data.rates.GBP,
      EUR_USD: 1 / data.rates.EUR,
      source: 'ExchangeRate API',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('Döviz API hatası:', err.message);
    return getFallbackRates();
  }
}

async function getGoldPrice() {
  try {
    // Ücretsiz altın fiyat API'si
    const response = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU');
    const data = await response.json();
    if (data.success && data.rates?.USDXAU) {
      return { price_usd: 1 / data.rates.USDXAU, source: 'MetalPrice API' };
    }
    return { price_usd: null, source: 'Veri alınamadı' };
  } catch {
    return { price_usd: null, source: 'Veri alınamadı' };
  }
}

function getFallbackRates() {
  return {
    USD_TRY: null,
    EUR_TRY: null,
    GBP_TRY: null,
    EUR_USD: null,
    source: 'Veri alınamadı - API\'ye erişilemiyor',
    timestamp: new Date().toISOString()
  };
}

async function getFinanceData() {
  const now = Date.now();
  if (FINANCE_CACHE.data && (now - FINANCE_CACHE.timestamp) < CACHE_DURATION) {
    return FINANCE_CACHE.data;
  }

  const [rates, gold] = await Promise.all([
    getExchangeRates(),
    getGoldPrice()
  ]);

  const result = {
    currencies: {
      USD_TRY: { value: rates.USD_TRY, label: 'Dolar/TL', icon: '$' },
      EUR_TRY: { value: rates.EUR_TRY, label: 'Euro/TL', icon: '€' },
      GBP_TRY: { value: rates.GBP_TRY, label: 'Sterlin/TL', icon: '£' },
      EUR_USD: { value: rates.EUR_USD, label: 'Euro/Dolar', icon: '€/$' }
    },
    commodities: {
      gold: { value: gold.price_usd, label: 'Altın (ons/USD)', icon: '🥇' }
    },
    correlations: [
      {
        title: 'Dolar & Altın İlişkisi',
        explanation: 'Dolar güçlendiğinde altın genellikle ucuzlar. Çünkü altın dolar cinsinden fiyatlandırılır ve dolar güçlü olduğunda yatırımcılar doları tercih eder.'
      },
      {
        title: 'Petrol & Enflasyon',
        explanation: 'Petrol fiyatları yükseldiğinde üretim ve taşıma maliyetleri artar, bu da genel fiyat seviyesini (enflasyonu) yükseltir.'
      },
      {
        title: 'Faiz & Döviz Kuru',
        explanation: 'Bir ülke faiz artırdığında para birimi değer kazanır çünkü yatırımcılar daha yüksek getiri için o ülkenin varlıklarına yönelir.'
      },
      {
        title: 'Risk İştahı & Güvenli Liman',
        explanation: 'Küresel belirsizlik arttığında yatırımcılar riskli varlıklardan (hisse senedi) güvenli limanlara (altın, ABD tahvili, İsviçre Frangı) yönelir.'
      }
    ],
    source: rates.source,
    lastUpdated: new Date().toISOString()
  };

  FINANCE_CACHE.data = result;
  FINANCE_CACHE.timestamp = now;

  return result;
}

module.exports = { getFinanceData };
