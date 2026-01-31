
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, CategoryID, ContentFormat, ContentItem, ViewState } from './types';
import { CATEGORIES } from './constants';
import { fetchDiscoveryContent } from './services/geminiService';
import BriefAI from './components/BriefAI';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'landing',
    selectedCategory: null,
    searchQuery: '',
    activeFormat: 'Videos',
    selectedItem: null,
    history: [],
    saved: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ContentItem[]>([]);

  const handleSelectCategory = (categoryId: CategoryID) => {
    setState(prev => ({ ...prev, selectedCategory: categoryId, view: 'search' }));
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setState(prev => ({ ...prev, searchQuery: query, view: 'discovery' }));
    
    const data = await fetchDiscoveryContent(state.selectedCategory!, query, state.activeFormat);
    setResults(data);
    setIsLoading(false);
  };

  const changeFormat = async (format: ContentFormat) => {
    setIsLoading(true);
    setState(prev => ({ ...prev, activeFormat: format }));
    const data = await fetchDiscoveryContent(state.selectedCategory!, state.searchQuery, format);
    setResults(data);
    setIsLoading(false);
  };

  const handleSelectItem = (item: ContentItem) => {
    setState(prev => ({ 
      ...prev, 
      view: 'player', 
      selectedItem: item,
      history: [item, ...prev.history.filter(h => h.id !== item.id)].slice(0, 50)
    }));
  };

  const toggleSave = (item: ContentItem) => {
    setState(prev => {
      const isSaved = prev.saved.some(s => s.id === item.id);
      if (isSaved) {
        return { ...prev, saved: prev.saved.filter(s => s.id !== item.id) };
      }
      return { ...prev, saved: [item, ...prev.saved] };
    });
  };

  const navigateTo = (view: ViewState) => {
    setState(prev => ({ ...prev, view }));
  };

  const currentCategory = CATEGORIES.find(c => c.id === state.selectedCategory);

  // Render sub-components based on state
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      {/* Navigation Bar */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-neutral-950/80 backdrop-blur-xl z-40">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigateTo('landing')}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl group-hover:bg-indigo-500 transition-colors">F</div>
          <span className="font-bold tracking-tight text-lg">FocusStream</span>
        </div>

        <div className="flex items-center gap-8">
          <button onClick={() => navigateTo('landing')} className={`flex items-center gap-2 text-sm font-medium ${state.view === 'landing' ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`}>
            <HomeIcon /> Home
          </button>
          <button onClick={() => {/* Mock library view */}} className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white">
            <LibraryIcon /> Library
          </button>
          <button onClick={() => {/* Mock downloads view */}} className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white">
            <DownloadIcon /> Downloads
          </button>
        </div>

        <div className="flex items-center gap-4">
          {state.selectedCategory && (
            <div className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-gradient-to-r ${currentCategory?.color} shadow-lg shadow-indigo-900/20`}>
              {currentCategory?.label}
            </div>
          )}
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <UserIcon />
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden">
        {state.view === 'landing' && (
          <LandingPage onSelect={handleSelectCategory} />
        )}

        {state.view === 'search' && (
          <SearchPage 
            category={currentCategory} 
            onSearch={handleSearch} 
            onBack={() => navigateTo('landing')}
          />
        )}

        {state.view === 'discovery' && (
          <DiscoveryPage 
            results={results}
            loading={isLoading}
            activeFormat={state.activeFormat}
            onChangeFormat={changeFormat}
            onSelectItem={handleSelectItem}
            query={state.searchQuery}
          />
        )}

        {state.view === 'player' && state.selectedItem && (
          <PlayerPage 
            item={state.selectedItem}
            isSaved={state.saved.some(s => s.id === state.selectedItem?.id)}
            onToggleSave={() => toggleSave(state.selectedItem!)}
            onBack={() => navigateTo('discovery')}
          />
        )}
      </main>

      {/* Floating AI Tool */}
      {state.searchQuery && (
        <BriefAI 
          topic={state.selectedItem ? state.selectedItem.title : state.searchQuery} 
          context={state.selectedItem ? state.selectedItem.description : `Category: ${state.selectedCategory}`}
        />
      )}
    </div>
  );
};

// Sub-components

const LandingPage: React.FC<{ onSelect: (id: CategoryID) => void }> = ({ onSelect }) => (
  <div className="max-w-7xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="text-center mb-16 space-y-4">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
        Filter the Digital Noise.
      </h1>
      <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
        Eliminate distractions. Access only verified, high-engagement content mapped to your professional and personal growth.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className="group relative h-64 w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 text-left p-8"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300">{cat.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-indigo-400 transition-colors">{cat.label}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">{cat.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const SearchPage: React.FC<{ category: any; onSearch: (q: string) => void; onBack: () => void }> = ({ category, onSearch, onBack }) => {
  const [query, setQuery] = useState('');
  
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 animate-in zoom-in-95 duration-500">
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950`} />
      <div className={`absolute top-0 w-full h-96 bg-gradient-to-b ${category.color} opacity-10 blur-[120px]`} />
      
      <div className="relative z-10 w-full max-w-3xl space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-zinc-900 rounded-3xl flex items-center justify-center text-4xl border border-white/10 shadow-2xl">
            {category.icon}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Search for high-value insights</h2>
          <p className="text-zinc-500 text-sm">Strictly filtering for {category.label} content only.</p>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); onSearch(query); }}
          className="relative group"
        >
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search topics, channels, or podcasts in ${category.label}...`}
            autoFocus
            className="w-full h-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 pl-14 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 font-light"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
            <SearchIcon />
          </div>
          <button 
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
          >
            Explore
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-3">
          {['Latest Trends', 'Top Channels', 'Academic Reviews', 'Quick Briefs'].map(tag => (
            <button key={tag} onClick={() => { setQuery(tag); onSearch(tag); }} className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const DiscoveryPage: React.FC<{ 
  results: ContentItem[]; 
  loading: boolean; 
  activeFormat: ContentFormat;
  onChangeFormat: (f: ContentFormat) => void;
  onSelectItem: (item: ContentItem) => void;
  query: string;
}> = ({ results, loading, activeFormat, onChangeFormat, onSelectItem, query }) => (
  <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col h-full">
    {/* Format Tabs */}
    <div className="flex items-center gap-2 border-b border-zinc-800 mb-8 overflow-x-auto pb-px">
      {['Videos', 'Podcasts', 'Documentaries', 'News', 'Articles'].map((format) => (
        <button
          key={format}
          onClick={() => onChangeFormat(format as ContentFormat)}
          className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${activeFormat === format ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          {format}
        </button>
      ))}
    </div>

    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-bold tracking-tight">Top 10 High-Value {activeFormat}</h3>
      <div className="text-xs text-zinc-500 font-mono">Sorted by Engagement Ratio &gt; 1</div>
    </div>

    {loading ? (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 animate-pulse font-light">Cross-referencing verified repositories...</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {results.map((item, idx) => (
          <div 
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group cursor-pointer flex flex-col h-full bg-zinc-900/30 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-black transition-all"
          >
            <div className="relative aspect-video overflow-hidden">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">
                RANK #{idx + 1}
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-indigo-600/90 backdrop-blur-md rounded text-[10px] font-bold text-white">
                RATIO: {item.ratio.toFixed(2)}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <h4 className="font-bold leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">{item.title}</h4>
                {item.verified && <span className="text-indigo-400 text-xs">✓</span>}
              </div>
              <p className="text-xs text-zinc-500 font-medium">{item.author}</p>
              <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed font-light">{item.description}</p>
              <div className="mt-auto flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest pt-4 border-t border-white/5">
                <span>{item.views.toLocaleString()} views</span>
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const PlayerPage: React.FC<{ item: ContentItem; isSaved: boolean; onToggleSave: () => void; onBack: () => void }> = ({ item, isSaved, onToggleSave, onBack }) => {
  const [recommended, setRecommended] = useState(false);
  
  return (
    <div className="h-full overflow-y-auto bg-neutral-950 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm">
          <ArrowLeftIcon /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-xl scale-110 group-hover:scale-125 transition-transform">
                  <PlayIcon />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start gap-6">
                <h2 className="text-3xl font-extrabold tracking-tight">{item.title}</h2>
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => { setRecommended(!recommended); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${recommended ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                  >
                    Recommend {recommended ? '✓' : ''}
                  </button>
                  <button 
                    onClick={onToggleSave}
                    className={`p-2.5 rounded-full transition-all border ${isSaved ? 'bg-zinc-800 border-indigo-500 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                  >
                    <BookmarkIcon />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-zinc-500 border-b border-zinc-800 pb-6">
                <span className="font-bold text-zinc-300">{item.author}</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                <span>{item.views.toLocaleString()} views</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                <span>Engagement Ratio: {item.ratio.toFixed(2)}</span>
              </div>

              <div className="bg-zinc-900/40 p-6 rounded-xl border border-white/5 space-y-4">
                <h4 className="font-bold text-zinc-100">About this content</h4>
                <p className="text-zinc-400 font-light leading-relaxed">{item.description}</p>
              </div>

              {/* Thought Section (Comments) */}
              <div className="space-y-6 pt-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight">Thought Section</h3>
                  <span className="text-xs font-mono text-zinc-500">{item.comments} insights shared</span>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0" />
                  <div className="flex-1">
                    <textarea 
                      placeholder="Add a thought or insight..."
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-none font-light"
                    />
                    <div className="flex justify-end mt-2">
                      <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">Post Thought</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mt-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex-shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-300">User_{i}392</span>
                          <span className="text-[10px] text-zinc-600">2h ago</span>
                        </div>
                        <p className="text-sm text-zinc-400 font-light">Highly valuable insights on how this integrates with current market paradigms. The methodology discussed at 4:20 is particularly useful for our upcoming project.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4">✨</div>
              <h3 className="text-xl font-bold">Brief-AI Context</h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                This content has been verified by FocusStream protocols. It is rated as High-Utility due to the engagement-to-view ratio.
              </p>
              <div className="pt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Credibility Score</span>
                  <span className="text-emerald-400 font-bold">98/100</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[98%]" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 px-2">Next Recommendations</h4>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 group cursor-pointer p-2 rounded-xl hover:bg-zinc-900 transition-colors">
                  <div className="w-24 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                    <img src={`https://picsum.photos/seed/rec${i}/200/200`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1 py-1">
                    <h5 className="text-xs font-bold leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">Advanced systems for global infrastructure and growth...</h5>
                    <p className="text-[10px] text-zinc-500">Channel Authority</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SVG Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const LibraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

export default App;
