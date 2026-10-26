import React, { useState } from 'react';
import {
  Clock,
  Tag,
  ArrowUpRight,
  X,
  TrendingUp,
  Share2,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function NewsView({ onSelectStock, onOpenTradeModal }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStory, setSelectedStory] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const categories = ['All', 'Market', 'Stocks', 'Economy', 'Crypto'];

  const newsItems = [
    {
      id: 1,
      title: 'Indian Markets Rally as Global Cues Turn Positive',
      summary: 'Benchmark indices Sensex and Nifty extended their winning streak on Thursday, driven by heavy buying in banking, IT, and telecom stocks following cooling inflation signals.',
      time: '2 hours ago',
      readTime: '3 min read',
      category: 'Market',
      author: 'TradeSphere Macro Desk',
      relatedTickers: [
        { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2892.45 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1678.90 },
        { symbol: 'INFY', name: 'Infosys Ltd', price: 1456.20 },
      ],
      paragraphs: [
        'Benchmark equity indices BSE Sensex and NSE Nifty 50 surged higher in Thursday’s morning session, propelled by heavy foreign institutional investment (FII) accumulation in frontline banking, financial services, and information technology heavyweights.',
        'The rally was ignited by easing headline consumer price inflation metrics across both domestic and international markets, reinforcing expectations that central banks may initiate gradual liquidity easing cycles in upcoming policy meetings.',
        'Sectoral indices reflected broad-based participation, with the Nifty Bank index jumping over 1.4% and the Nifty IT basket gaining 1.8%. Market strategists noted that domestic institutional investors (DIIs) provided strong baseline absorption, preventing mid-session profit-taking.',
        'Going forward, market participants will closely monitor upcoming quarterly corporate earnings, crude oil supply developments, and foreign exchange movements against the US dollar.'
      ],
      keyTakeaways: [
        'Nifty 50 approaches fresh psychological resistance supported by BFSI leadership.',
        'Cooling headline inflation numbers reinforce global rate normalization expectations.',
        'FII net cash segment positioning turned positive for the third consecutive session.'
      ]
    },
    {
      id: 2,
      title: 'RBI Keeps Repo Rate Unchanged at 6.50%',
      summary: 'The Monetary Policy Committee unanimously resolved to retain the policy repo rate at 6.50% while reiterating its commitment to durable inflation targeting.',
      time: '4 hours ago',
      readTime: '4 min read',
      category: 'Economy',
      author: 'TradeSphere Central Banking Bureau',
      relatedTickers: [
        { symbol: 'SBIN', name: 'State Bank of India', price: 612.40 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1678.90 },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1234.50 },
      ],
      paragraphs: [
        'The Reserve Bank of India’s Monetary Policy Committee (MPC) opted to maintain the benchmark policy repo rate steady at 6.50%, aligning with broad street consensus while keeping its policy stance focused on withdrawal of accommodation to align inflation durably with the 4% target.',
        'Governor Shaktikanta Das highlighted that while domestic economic activity remains exceptionally robust, propelled by private capital expenditure and rural demand recovery, recurring climate-driven food price shocks require continued policy vigilance.',
        'Financial institutions cheered the announcement as net interest margins (NIMs) are expected to stabilize over the next two fiscal quarters. Real estate demand and retail housing credit disbursements also maintained upward trajectory without rate hike headwinds.',
        'The central bank retained its real GDP growth projection for the current financial year at 7.0%, reflecting strong confidence in domestic macroeconomic fundamentals despite global geopolitical uncertainties.'
      ],
      keyTakeaways: [
        'Repo rate retained at 6.50% with unanimous vote across MPC members.',
        'Domestic GDP growth projection maintained at strong 7.0% for FY 2024-25.',
        'Private banking sector margins expected to benefit from stable yield curve.'
      ]
    },
    {
      id: 3,
      title: 'Reliance Reports Strong Q2 Earnings with Telecom Surge',
      summary: 'Consolidated revenue for the quarter rose 11.5% YoY, supported by record retail footfall and high ARPU expansion across digital telecom infrastructure.',
      time: '6 hours ago',
      readTime: '3 min read',
      category: 'Stocks',
      author: 'Equities Research Division',
      relatedTickers: [
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2892.45 },
      ],
      paragraphs: [
        'Energy and telecommunications conglomerate Reliance Industries Limited (RIL) delivered strong consolidated financial results for the quarter ended September 30, with quarterly revenues rising 11.5% year-on-year to ₹9,74,864 Crore ($118B).',
        'The digital telecommunications arm, Reliance Jio, proved to be the stellar growth engine, clocking 14.2% top-line growth driven by consistent 5G subscriber additions and an uptick in Average Revenue Per User (ARPU) following recent tariff rationalization.',
        'Meanwhile, the organized retail division witnessed record footfall across consumer electronics, fashion, and grocery footprints, reporting quarterly EBITDA margin expansion of 40 basis points to 17.8%.',
        'Consolidated net profit stood at ₹79,020 Crore, exceeding consensus estimates by 3.2%. Management emphasized accelerated capital deployment in renewable green hydrogen projects and next-generation AI data centers.'
      ],
      keyTakeaways: [
        'Consolidated quarterly revenue grew 11.5% YoY to ₹9,74,864 Crore.',
        'Telecom ARPU and 5G subscriber adoption accelerated revenue expansion.',
        'Retail footfalls and profitability margins touched fresh all-time highs.'
      ]
    },
    {
      id: 4,
      title: 'Tech Stocks Lead Wall Street Higher After Semiconductor Breakthroughs',
      summary: 'Nasdaq Composite gained 1.56% as mega-cap chipmakers surged to fresh record highs on next-generation artificial intelligence hardware deployments.',
      time: '8 hours ago',
      readTime: '4 min read',
      category: 'Market',
      author: 'Global Tech & Silicon Desk',
      relatedTickers: [
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.30 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 412.30 },
        { symbol: 'AAPL', name: 'Apple Inc.', price: 188.50 },
      ],
      paragraphs: [
        'Wall Street closed decisively in green territory on Wednesday, spearheaded by astronomical demand for advanced enterprise generative artificial intelligence accelerators and high-bandwidth memory (HBM) silicon.',
        'NVIDIA and its semiconductor supply ecosystem surged over 3.5%, pulling the technology-heavy Nasdaq Composite higher by 1.56%. Microsoft and Alphabet also witnessed significant institutional accumulation as hyperscale cloud spending numbers topped Wall Street projections.',
        'Industry analysts pointed to accelerating capex forecasts across mega-cap technology firms, estimating over $200 Billion in aggregate infrastructure investments slated for custom AI silicon, data centers, and optical interconnect networks over the coming year.',
        'Market sentiment received an additional boost from stabilizing Treasury yields, providing favorable valuation multiples for high-growth enterprise software and hardware champions.'
      ],
      keyTakeaways: [
        'Semiconductor sector surges over 3.4% on relentless generative AI compute demand.',
        'Hyperscalers lift full-year cloud and data center capital expenditure budgets.',
        'Nasdaq composite registers strongest single-session gain in six weeks.'
      ]
    },
    {
      id: 5,
      title: 'Federal Reserve Notes Balance Sheet Normalization Progress',
      summary: 'Global yields stabilized as central bankers noted resilient employment numbers paired with moderation in producer prices across prime sectors.',
      time: '10 hours ago',
      readTime: '3 min read',
      category: 'Economy',
      author: 'Fixed Income & Macro Strategy',
      relatedTickers: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 188.50 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.90 },
      ],
      paragraphs: [
        'Senior Federal Reserve officials signaled that the ongoing balance sheet normalization program—commonly termed quantitative tightening (QT)—is progressing smoothly with minimal disruptions to overnight bank funding markets.',
        'Speaking at an economic symposium, central bank officials underscored that both the Consumer Price Index (CPI) and Personal Consumption Expenditures (PCE) price metrics have shown encouraging multi-month deceleration toward the Fed’s statutory 2% baseline.',
        'Benchmark 10-year US Treasury yields cooled by 6 basis points to 4.18%, easing financial conditions and providing supportive tailwinds for equity valuations and consumer discretionary spending.',
        'Traders in the interest rate derivatives market have priced in an 85% probability of continued policy easing at subsequent FOMC gatherings.'
      ],
      keyTakeaways: [
        'Quantitative tightening run-off continues without money market stress.',
        '10-year US Treasury yield eases to 4.18%, supporting global risk asset appetite.',
        'Rate futures price high likelihood of continued rate normalization in 2025.'
      ]
    },
    {
      id: 6,
      title: 'Ethereum and Bitcoin Consolidate Around Key Psychological Resistance',
      summary: 'Digital asset volumes climbed as institutional inflow through regulated exchange-traded products recorded consecutive net accumulation weeks.',
      time: '12 hours ago',
      readTime: '3 min read',
      category: 'Crypto',
      author: 'Digital Asset Intelligence Unit',
      relatedTickers: [
        { symbol: 'BTC', name: 'Bitcoin', price: 67450.00 },
        { symbol: 'ETH', name: 'Ethereum', price: 3520.80 },
        { symbol: 'SOL', name: 'Solana', price: 174.60 },
      ],
      paragraphs: [
        'Bitcoin and Ethereum traded tightly near critical multi-month resistance levels, absorbing heavy daily volumes as regulated exchange-traded fund (ETF) vehicles registered their seventh consecutive week of positive net inflows.',
        'On-chain analysis revealed that long-term holder supply reached an all-time high of 74%, indicating strong conviction among institutional accumulators and reduced sell-side liquid float on centralized trading venues.',
        'Layer-1 smart contract protocols, led by Solana and Ethereum, experienced significant decentralized application volume growth, driven by institutional real-world asset (RWA) tokenization pilot programs and decentralized finance liquidity depth.',
        'Derivatives data suggests a build-up in call options open interest expiring toward the end of the quarter, highlighting bullish positioning across institutional counterparties.'
      ],
      keyTakeaways: [
        'Spot Bitcoin and Ethereum ETFs record uninterrupted institutional accumulation.',
        'Long-term illiquid supply reaches 74%, creating significant supply scarcity.',
        'Institutional real-world asset tokenization drives layer-1 protocol volume expansion.'
      ]
    },
  ];

  const filtered = activeCategory === 'All'
    ? newsItems
    : newsItems.filter((n) => n.category.toLowerCase() === activeCategory.toLowerCase());

  const handleToggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleShareStory = (story, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${story.title} — TradeSphere Market Wire`);
      setCopiedId(story.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="ts-news-view">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Market News &amp; Intelligence</h1>
          <p className="view-subtitle">Curated macroeconomic analysis, quarterly corporate earnings, and real-time market wires</p>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="category-tabs-group mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Cards Grid */}
      <div className="news-cards-grid">
        {filtered.map((item) => {
          const isBookmarked = bookmarkedIds.includes(item.id);
          const isCopied = copiedId === item.id;
          return (
            <article
              key={item.id}
              className="ts-card news-card-item"
              onClick={() => setSelectedStory(item)}
              style={{ cursor: 'pointer' }}
            >
              {/* Visual Banner */}
              <div className="news-card-banner">
                <div className="news-badge-overlay">
                  <Tag size={12} />
                  <span>{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-icon-topbar"
                    style={{ width: '28px', height: '28px', background: 'rgba(0,0,0,0.5)', border: 'none' }}
                    onClick={(e) => handleToggleBookmark(item.id, e)}
                    title={isBookmarked ? 'Remove Bookmark' : 'Save Story'}
                  >
                    <Bookmark size={13} fill={isBookmarked ? '#10B981' : 'transparent'} stroke={isBookmarked ? '#10B981' : '#94A3B8'} />
                  </button>
                  <span className="news-time-pill">
                    <Clock size={11} />
                    <span>{item.time}</span>
                  </span>
                </div>
              </div>

              <div className="news-card-body">
                <h3 className="news-headline">{item.title}</h3>
                <p className="news-summary">{item.summary}</p>

                <div className="news-footer-row">
                  <span className="news-source">{item.author || 'TradeSphere Wire'}</span>
                  <button
                    type="button"
                    className="news-read-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStory(item);
                    }}
                  >
                    Read Full Story <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* FULL STORY MODAL / READER */}
      {selectedStory && (
        <div className="modal-backdrop" onClick={() => setSelectedStory(null)}>
          <div
            className="modal-content modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '760px', maxHeight: '88vh', overflowY: 'auto' }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ marginBottom: '14px', alignItems: 'center' }}>
              <div className="flex items-center gap-3">
                <span className="cat-pill active" style={{ padding: '4px 12px', fontSize: '11px' }}>
                  {selectedStory.category}
                </span>
                <span className="text-muted text-xs flex items-center gap-1">
                  <Clock size={12} /> {selectedStory.time} • {selectedStory.readTime || '3 min read'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-icon-topbar"
                  onClick={(e) => handleShareStory(selectedStory, e)}
                  title="Share or Copy Link"
                >
                  {copiedId === selectedStory.id ? <CheckCircle2 size={16} className="text-emerald" /> : <Share2 size={16} />}
                </button>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setSelectedStory(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Headline & Meta */}
            <h2 className="text-2xl font-bold text-white mb-3" style={{ lineHeight: 1.3 }}>
              {selectedStory.title}
            </h2>

            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-800" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
              <div className="stock-logo-circle" style={{ width: '28px', height: '28px', fontSize: '10px' }}>
                TS
              </div>
              <div>
                <span className="text-white text-xs font-semibold block">{selectedStory.author}</span>
                <span className="text-muted text-xs">TradeSphere Financial News Network</span>
              </div>
            </div>

            {/* Lead Summary Callout */}
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                borderLeft: '4px solid #10B981',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}
            >
              <p className="text-white font-medium text-sm leading-relaxed m-0">
                "{selectedStory.summary}"
              </p>
            </div>

            {/* Full Story Paragraphs */}
            <div className="news-story-paragraphs" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {selectedStory.paragraphs.map((p, idx) => (
                <p key={idx} className="text-slate-300 text-sm leading-relaxed" style={{ lineHeight: '1.7', margin: 0 }}>
                  {p}
                </p>
              ))}
            </div>

            {/* Key Takeaways Box */}
            {selectedStory.keyTakeaways && (
              <div
                className="ts-card mb-6"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '18px',
                  borderRadius: '10px',
                  marginBottom: '24px'
                }}
              >
                <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald" />
                  Key Market Takeaways
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedStory.keyTakeaways.map((point, i) => (
                    <li key={i} className="text-slate-300 text-xs leading-normal">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Equities & Direct Trade CTA */}
            {selectedStory.relatedTickers && selectedStory.relatedTickers.length > 0 && (
              <div className="mb-6" style={{ marginBottom: '20px' }}>
                <h4 className="text-muted text-xs font-bold uppercase tracking-wider mb-3">
                  Mentioned Assets &amp; Direct Trade Actions:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {selectedStory.relatedTickers.map((ticker) => (
                    <div
                      key={ticker.symbol}
                      className="ts-card flex-between"
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <div>
                        <strong className="text-white text-sm block">{ticker.symbol}</strong>
                        <span className="text-muted text-xs">{ticker.name}</span>
                        <div className="text-emerald text-xs font-semibold mt-0.5">${ticker.price.toFixed(2)}</div>
                      </div>
                      <div className="flex gap-1" style={{ display: 'flex', gap: '6px' }}>
                        {onSelectStock && (
                          <button
                            type="button"
                            className="btn-secondary-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => {
                              setSelectedStory(null);
                              onSelectStock({ name: ticker.name, sku: ticker.symbol, price: ticker.price });
                            }}
                            title="Inspect in Terminal"
                          >
                            Details
                          </button>
                        )}
                        {onOpenTradeModal && (
                          <button
                            type="button"
                            className="btn-table-trade"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => {
                              setSelectedStory(null);
                              onOpenTradeModal({ name: ticker.name, sku: ticker.symbol, price: ticker.price }, 'BUY');
                            }}
                          >
                            Trade
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Modal Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '16px'
              }}
            >
              <button
                type="button"
                className="btn-trade-primary"
                onClick={() => setSelectedStory(null)}
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
