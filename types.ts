
export type CategoryID = 'education' | 'business' | 'politics' | 'culture' | 'health' | 'science';

export interface Category {
  id: CategoryID;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export type ContentFormat = 'Videos' | 'Podcasts' | 'Documentaries' | 'News' | 'Articles';

export interface ContentItem {
  id: string;
  title: string;
  author: string;
  views: number;
  likes: number;
  comments: number;
  ratio: number;
  thumbnail: string;
  description: string;
  format: ContentFormat;
  category: CategoryID;
  verified: boolean;
  publishedAt: string;
}

export type ViewState = 'landing' | 'search' | 'discovery' | 'player';

export interface AppState {
  view: ViewState;
  selectedCategory: CategoryID | null;
  searchQuery: string;
  activeFormat: ContentFormat;
  selectedItem: ContentItem | null;
  history: ContentItem[];
  saved: ContentItem[];
}
