import React, { useState } from "react";
import { TopBar } from "./TopBar";
import { COMMUNITY_ARTICLES } from "../data/mockData";
import { Article } from "../types";

interface LearnViewProps {
  onBack?: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>("1");

  const categories = [
    { id: "all", label: "All" },
    { id: "Ergonomics", label: "Ergonomics" },
    { id: "Falls", label: "Falls" },
    { id: "Child Development", label: "Child Dev." },
    { id: "Nutrition", label: "Nutrition" },
    { id: "Mental Health", label: "Mental Health" },
  ];

  const filteredArticles =
    activeFilter === "all"
      ? COMMUNITY_ARTICLES
      : COMMUNITY_ARTICLES.filter((a) => a.category === activeFilter);

  const toggleArticle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      <TopBar title="Community Health" subtitle="Prevention tips & everyday guidance" onBack={onBack} />

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto p-4 bg-white border-b border-slate-200">
        {categories.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "bg-slate-100 text-[var(--primary)] hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <main className="p-4 max-w-lg mx-auto space-y-3">
        {filteredArticles.map((article) => {
          const isExpanded = expandedId === article.id;
          return (
            <div
              key={article.id}
              onClick={() => toggleArticle(article.id)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-[var(--primary)] transition-all"
            >
              <span className="font-mono text-[10px] tracking-wider uppercase text-slate-500 font-semibold">
                {article.category}
              </span>

              <h3 className="font-serif text-xl font-normal text-[var(--primary)] my-1">{article.title}</h3>

              <p className="text-[11px] text-slate-400 mb-2">{article.readTime}</p>

              {isExpanded && (
                <p className="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-2">
                  {article.body}
                </p>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};
