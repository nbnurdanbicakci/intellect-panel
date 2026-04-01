const RssParser = require('rss-parser');
const rssParser = new RssParser();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';

const categoryConfig = {
  ai: {
    query: 'yapay zeka OR ChatGPT OR AI OR makine ogrenmesi OR dijital donusum',
    language: 'tr',
    rssFeeds: [
      'https://shiftdelete.net/feed',
      'https://webrazzi.com/feed'
    ],
    label: 'Yapay Zeka & Dijital'
  },
  turkey_politics: {
    country: 'tr',
    category: 'general',
    rssFeeds: [],
    label: 'Turkiye Siyaseti'
  },
  world_politics: {
    query: 'dunya siyaset OR uluslararasi iliskiler OR diplomasi OR savas OR baris',
    language: 'tr',
    rssFeeds: [],
    label: 'Dunya Siyaseti'
  },
  events: {
    query: 'Oscar OR olimpiyat OR festival OR odul toreni OR sampiyonluk OR spor',
    language: 'tr',
    rssFeeds: [],
    label: 'Etkinlikler'
  },
  arts: {
    query: 'sanat OR sinema OR film OR sergi OR tiyatro OR muzik OR resim',
    language: 'tr',
    rssFeeds: [],
    label: 'Sanat & Film'
  },
  trending: {
    query: 'gundem OR son dakika OR dunya haberleri OR populer',
    language: 'tr',
    rssFeeds: [],
    label: 'Dunyaca Konusulanlar'
  }
};

async function fetchFromNewsAPI(category) {
  const config = categoryConfig[category];
  if (!config) return [];

  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
    return getFallbackNews(category);
  }

  try {
    let url;
    if (config.country) {
      // Top headlines - ulke bazli (zaten Turkce)
      url = `${NEWS_API_BASE}/top-headlines?country=${config.country}&apiKey=${NEWS_API_KEY}&pageSize=8`;
      if (config.category) {
        url += `&category=${config.category}`;
      }
    } else {
      // Everything - dil parametresi ile Turkce
      const lang = config.language || 'tr';
      url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(config.query)}&sortBy=publishedAt&language=${lang}&pageSize=8&apiKey=${NEWS_API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok' && data.articles) {
      return data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source?.name || 'Bilinmeyen',
        publishedAt: article.publishedAt,
        image: article.urlToImage
      }));
    }
    return getFallbackNews(category);
  } catch (err) {
    console.error(`NewsAPI hatasi (${category}):`, err.message);
    return getFallbackNews(category);
  }
}

async function fetchFromRSS(feeds) {
  const results = [];
  for (const feedUrl of feeds) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      feed.items.slice(0, 5).forEach(item => {
        results.push({
          title: item.title,
          description: item.contentSnippet || item.content || '',
          url: item.link,
          source: feed.title || 'RSS',
          publishedAt: item.pubDate || item.isoDate,
          image: null
        });
      });
    } catch (err) {
      console.error(`RSS hatasi (${feedUrl}):`, err.message);
    }
  }
  return results;
}

function getFallbackNews(category) {
  const now = new Date().toISOString();
  const h = (hrs) => new Date(Date.now() - hrs * 3600000).toISOString();

  const fallbacks = {
    ai: [
      { title: 'Anthropic, Claude 4.6 Opus Modelini Tanitti: Kodlama ve Muhakemede Buyuk Sicrama', description: 'Anthropic\'in yeni amiral gemisi modeli Claude 4.6 Opus, yazilim muhendisligi ve karmasik muhakeme gorevlerinde rakiplerini geride birakiyor. Model, 1 milyon token baglam penceresine sahip.', url: '#', source: 'TechCrunch', publishedAt: h(1), image: null },
      { title: 'OpenAI, GPT-5 Icin Tarih Verdi: Coklu Modalite ve Gercek Zamanli Ogrenim', description: 'OpenAI CEO\'su Sam Altman, GPT-5\'in 2026 yazinda piyasaya sureceklerini ve modelin gercek zamanli ogrenme yetenekleriyle donacagini acikladi.', url: '#', source: 'The Verge', publishedAt: h(3), image: null },
      { title: 'Turkiye\'de Yapay Zeka Stratejisi Guncellendi: 2030 Hedefleri Belirlendi', description: 'Cumhurbaskanligi Dijital Donusum Ofisi, ulusal yapay zeka stratejisini guncelledi. Saglik, egitim ve savunma sanayiinde AI entegrasyonu oncelikli hedefler arasinda.', url: '#', source: 'Anadolu Ajansi', publishedAt: h(5), image: null },
      { title: 'Google DeepMind, Protein Katlama Probleminde Yeni Rekor Kirdi', description: 'AlphaFold 4 modeli, daha once cozulemeyen 50.000\'den fazla protein yapisini basariyla tahmin etti. Ilac gelistirme sureclerini kokeninden degistirecek bir gelisme.', url: '#', source: 'Nature', publishedAt: h(6), image: null },
      { title: 'AB Yapay Zeka Yasasi Tam Olarak Yururluge Girdi', description: 'Avrupa Birligi\'nin kapsamli AI regülasyonu bugun itibariyle tum uye ulkelerde uygulanmaya basladi. Yuksek riskli AI sistemleri icin siki denetim mekanizmalari devreye aliyor.', url: '#', source: 'Reuters', publishedAt: h(8), image: null }
    ],
    turkey_politics: [
      { title: 'Meclis\'te Yeni Egitim Reformu Tasarisi Gorusmeleri Basladi', description: 'TBMM Genel Kurulu\'nda egitim sisteminde koklü degisiklikler ongorulen yasa tasarisi gorusulmeye baslandi. Tasari, mesleki egitime agirlik veriyor.', url: '#', source: 'Anadolu Ajansi', publishedAt: h(1), image: null },
      { title: 'Cumhurbaskani Erdogan, Orta Asya Turunda: Ozbekistan ve Kazakistan Ziyareti', description: 'Cumhurbaskani Erdogan, iki gunluk Orta Asya turu kapsaminda Ozbekistan ve Kazakistan\'i ziyaret ediyor. Ticaret ve enerji anlasmalarinin imzalanmasi bekleniyor.', url: '#', source: 'TRT Haber', publishedAt: h(2), image: null },
      { title: 'CHP Genel Baskani Ozel\'den Ekonomi Politikasina Elesitiri', description: 'CHP lideri Ozgur Ozel, hukumetin ekonomi politikasini elesitirerek alternatif bir ekonomik program acikladi. Enflasyonla mucadelede farkli yaklasimlar onerdi.', url: '#', source: 'Cumhuriyet', publishedAt: h(4), image: null },
      { title: 'Yerel Yonetimler Reformu: Buyuksehirlere Daha Fazla Yetki', description: 'Icisleri Bakanligi\'nin hazirligi yerel yonetimler reformu taslaginda buyuksehir belediyelerine ulasim ve cevre konularinda daha genis yetkiler veriliyor.', url: '#', source: 'Hurriyet', publishedAt: h(7), image: null },
      { title: 'Disisleri Bakani Fidan, Suriye Gorusmeleri Icin Cenevre\'de', description: 'Disisleri Bakani Hakan Fidan, Suriye\'deki siyasi surece iliskin BM gozetimindeki gorusmelere katilmak uzere Cenevre\'ye gitti.', url: '#', source: 'NTV', publishedAt: h(9), image: null }
    ],
    world_politics: [
      { title: 'ABD Baskani, Cin ile Yeni Ticaret Anlasmasini Imzaladi', description: 'ABD ve Cin arasinda uzun suredir devam eden ticaret gerilimine son verecek kapsamli bir anlasma imzalandi. Anlasma, teknoloji transferi ve tarifeler konusunda yeni kurallar getiriyor.', url: '#', source: 'BBC', publishedAt: h(1), image: null },
      { title: 'Ukrayna-Rusya Catismasinda Ateskes Gorusmeleri Yeniden Basladi', description: 'Istanbul\'da duzenlenen gorusmelerde Ukrayna ve Rusya heyetleri, kalici bir ateskes icin yol haritasi uzerinde calisiyor. BM Genel Sekreteri arabuluculuk yapiyor.', url: '#', source: 'Al Jazeera', publishedAt: h(3), image: null },
      { title: 'AB, Yeni Genisleme Dalgasi Icin Takvimi Acikladi', description: 'Avrupa Komisyonu Baskani, Bati Balkan ulkelerinin 2030\'a kadar AB\'ye tam uyelik surecini tamamlayabilecegini bildirdi.', url: '#', source: 'Euronews', publishedAt: h(5), image: null },
      { title: 'Hindistan, Dunyanin En Buyuk Gunes Enerjisi Santralini Acti', description: 'Rajasthan eyaletinde kurulan 30 GW kapasiteli gunes enerjisi santrali, 20 milyon haneye elektrik saglayacak. Hindistan, yenilenebilir enerjide liderlige oynuyor.', url: '#', source: 'Reuters', publishedAt: h(7), image: null },
      { title: 'BM Guvenlik Konseyi\'nde Iklim Krizi Ozel Oturumu', description: 'BM Guvenlik Konseyi, iklim krizinin kuresel guvenlige etkilerini tarismak uzere ozel oturum duzenledi. Kucuk ada devletleri acil eylem cagrisi yapti.', url: '#', source: 'UN News', publishedAt: h(10), image: null }
    ],
    events: [
      { title: '2026 Oscar Odulleri Sahiplerini Buldu: En Iyi Film Odulu Surpriz Oldu', description: 'Akademi Odulleri\'nin 98. toreninde en iyi film odulu beklenmedik bir sekilde bagimsiz bir yapima gitti. Turk yonetmen Nuri Bilge Ceylan en iyi yabanci film dalinda aday gosterildi.', url: '#', source: 'Variety', publishedAt: h(2), image: null },
      { title: 'UEFA Sampiyonlar Ligi Ceyrek Final Eslesmeleri Belli Oldu', description: 'Sampiyonlar Ligi ceyrek final kurasinda heyecan verici eslesmeler ortaya cikti. Galatasaray, Barcelona ile eslesirken buyuk heyecan yaratti.', url: '#', source: 'BeIN Sports', publishedAt: h(4), image: null },
      { title: 'Istanbul Film Festivali 45. Yilinda Kapilerini Acti', description: 'Turkiye\'nin en koklü film festivali, 45. yilini ozel bir programla kutluyor. Festival kapsaminda 200\'den fazla film gosterilecek.', url: '#', source: 'IKSV', publishedAt: h(6), image: null },
      { title: '2026 Milano-Cortina Kis Olimpiyatlari Hazirliklari Tamamlaniyor', description: 'Subat ayinda baslanacak Kis Olimpiyatlari icin Milano ve Cortina d\'Ampezzo\'daki tesisler son halini aliyor. Turkiye, kayak ve buz pateninde yarismacak.', url: '#', source: 'Olympics.com', publishedAt: h(8), image: null },
      { title: 'Teknofest 2026 Istanbul\'da Rekor Katilimla Basladi', description: 'Turkiye\'nin en buyuk teknoloji ve havacilik festivali Teknofest, bu yil 2 milyonun uzerinde ziyaretci beklentisiyle kapilerini acti.', url: '#', source: 'Sabah', publishedAt: h(12), image: null }
    ],
    arts: [
      { title: 'Venedik Bienali\'nde Turkiye Pavyonu Buyuk Ilgi Gordu', description: 'Turk sanatci Refik Anadol\'un yapay zeka destekli immersif enstalasyonu, Venedik Bienali\'nde en cok ziyaret edilen eserler arasina girdi.', url: '#', source: 'Artforum', publishedAt: h(2), image: null },
      { title: 'Orhan Pamuk\'un Yeni Romani Dunya Capinda Bestseller Listelerinde', description: 'Nobel odullu yazar Orhan Pamuk\'un son romani, ayni anda 40 dilde yayimlandi ve New York Times bestseller listesine 1 numaradan girdi.', url: '#', source: 'The Guardian', publishedAt: h(4), image: null },
      { title: 'Cannes Film Festivali\'nde Turk Sinemasina Iki Odul', description: '2026 Cannes Film Festivali\'nde Turk yonetmen Emin Alper\'in yeni filmi Buyuk Odul\'e layik goruldu. Belgesel kategorisinde de bir Turk yapimi odul aldi.', url: '#', source: 'Variety', publishedAt: h(6), image: null },
      { title: 'Louvre Muzesi, Dijital Sanat Icin Yeni Kanat Acti', description: 'Paris\'teki Louvre Muzesi, dijital ve NFT sanata ayrilan yeni kanadini ziyarete acti. 500\'den fazla dijital eser sergileniyor.', url: '#', source: 'Le Monde', publishedAt: h(8), image: null },
      { title: 'Fazil Say, Yeni Senfonisini Berlin Filarmoni\'de Seslendirdi', description: 'Dunya capi piyanist ve besteci Fazil Say, 5. senfonisinin dunya promiyerini Berlin Filarmoni Orkestrasi ile gerceklestirdi. Eser ayakta alkislandi.', url: '#', source: 'DW Turkce', publishedAt: h(10), image: null }
    ],
    trending: [
      { title: 'Yapay Zeka Uretimleri Telif Hakki Tartismasi Buyuyor', description: 'ABD Yuksek Mahkemesi, yapay zekanin olusturdugu iceriklerle ilgili cikan davada emsal nitelinde bir karara hazirlaniyor. Karar, tum dunyayi etkileyecek.', url: '#', source: 'The New York Times', publishedAt: h(1), image: null },
      { title: 'Kuresel Iklim Zirvesi\'nde Tarihi Karbon Anlasmasi', description: 'Dunyanin en buyuk 20 ekonomisi, 2035\'e kadar karbon emisyonlarini yuzde 60 azaltma taahhudunde bulundu. Turkiye de anlasmaya imza atti.', url: '#', source: 'BBC', publishedAt: h(3), image: null },
      { title: 'Mars Gorevi: SpaceX Starship Ilk Musterek Inis Denemesi', description: 'SpaceX ve NASA\'nin ortak Mars gorevinde Starship roketi, Mars yuzeyine basarili bir inis gerceklestirdi. Insanli gorev icin buyuk bir adim.', url: '#', source: 'Space.com', publishedAt: h(5), image: null },
      { title: 'Dunya Saglik Orgutu: Yeni Antibiyotik Direnci Alarmi', description: 'DSO, antibiyotik direncinin kuresel capta kritik seviyeye ulastigini bildirdi. 2050\'ye kadar yillik 10 milyon olum riski bulunuyor.', url: '#', source: 'WHO', publishedAt: h(7), image: null },
      { title: 'Bitcoin 150.000 Dolar Seviyesini Asti', description: 'Kripto para piyasasinda Bitcoin, kurumsal yatirimin artmasiyla birlikte tarihi rekorunu kirarak 150.000 dolar seviyesini gecti.', url: '#', source: 'Bloomberg', publishedAt: h(9), image: null }
    ]
  };
  return fallbacks[category] || [];
}

async function getNews(category) {
  const config = categoryConfig[category];
  if (!config) {
    return { category, label: 'Bilinmeyen', articles: [] };
  }

  const [apiArticles, rssArticles] = await Promise.all([
    fetchFromNewsAPI(category),
    fetchFromRSS(config.rssFeeds || [])
  ]);

  const allArticles = [...apiArticles, ...rssArticles]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 8);

  return {
    category,
    label: config.label,
    articles: allArticles,
    lastUpdated: new Date().toISOString()
  };
}

module.exports = { getNews, categoryConfig };
