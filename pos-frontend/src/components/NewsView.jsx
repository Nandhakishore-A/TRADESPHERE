import React, { useState } from 'react';
import {
  Clock,
  Tag,
  ArrowUpRight
} from 'lucide-react';

export default function NewsView() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Market', 'Stocks', 'Economy', 'Crypto'];

  const newsItems = [
    {
      id: 1,
      title: 'Indian Markets Rally as Global Cues Turn Positive',
      summary: 'Benchmark indices Sensex and Nifty extended their winning streak on Thursday, driven by heavy buying in banking, IT, and telecom stocks following cooling inflation signals.',
      time: '2 hours ago',
      category: 'Market',
    },
    {
      id: 2,
      title: 'RBI Keeps Repo Rate Unchanged at 6.50%',
      summary: 'The Monetary Policy Committee unanimously resolved to retain the policy repo rate at 6.50% while reiterating its commitment to durable inflation targeting.',
      time: '4 hours ago',
      category: 'Economy',
    },
    {
      id: 3,
      title: 'Reliance Reports Strong Q2 Earnings with Telecom Surge',
      summary: 'Consolidated revenue for the quarter rose 11.5% YoY, supported by record retail footfall and high ARPU expansion across digital telecom infrastructure.',
      time: '6 hours ago',
      category: 'Stocks',
    },
    {
      id: 4,
      title: 'Tech Stocks Lead Wall Street Higher After Semiconductor Breakthroughs',
      summary: 'Nasdaq Composite gained 1.56% as mega-cap chipmakers surged to fresh record highs on next-generation artificial intelligence hardware deployments.',
      time: '8 hours ago',
      category: 'Market',
    },
    {
      id: 5,
      title: 'Federal Reserve Notes Balance Sheet Normalization Progress',
      summary: 'Global yields stabilized as central bankers noted resilient employment numbers paired with moderation in producer prices across prime sectors.',
      time: '10 hours ago',
      category: 'Economy',
    },
    {
      id: 6,
      title: 'Ethereum and Bitcoin Consolidate Around Key Psychological Resistance',
      summary: 'Digital asset volumes climbed as institutional inflow through regulated exchange-traded products recorded consecutive net accumulation weeks.',
      time: '12 hours ago',
      category: 'Crypto',
    },
  ];

  const filtered = activeCategory === 'All'
    ? newsItems
    : newsItems.filter((n) => n.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="ts-news-view">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Market News</h1>
          <p className="view-subtitle">Curated financial intelligence, macroeconomic alerts, and stock updates</p>
        </div>
      </div>

      {/* Category Pills */}
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

      {/* News Grid */}
      <div className="news-cards-grid">
        {filtered.map((item) => (
          <article key={item.id} className="ts-card news-card-item">
            {/* Visual Header / Banner */}
            <div className="news-card-banner">
              <div className="news-badge-overlay">
                <Tag size={12} />
                <span>{item.category}</span>
              </div>
              <span className="news-time-pill">
                <Clock size={11} />
                <span>{item.time}</span>
              </span>
            </div>

            <div className="news-card-body">
              <h3 className="news-headline">{item.title}</h3>
              <p className="news-summary">{item.summary}</p>

              <div className="news-footer-row">
                <span className="news-source">TradeSphere Wire</span>
                <span className="news-read-more">
                  Read Full Story <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
