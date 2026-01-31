
import { Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'education',
    label: 'Education & Skills',
    description: 'Learn new disciplines and master modern skills.',
    icon: '🎓',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'business',
    label: 'Business & Finance',
    description: 'Market analysis, entrepreneurship, and wealth management.',
    icon: '💼',
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'politics',
    label: 'Political Content',
    description: 'Geopolitics, policy analysis, and global governance.',
    icon: '⚖️',
    color: 'from-rose-600 to-pink-700'
  },
  {
    id: 'culture',
    label: 'Cultural & Religious',
    description: 'Philosophical insights and deep cultural perspectives.',
    icon: '🏺',
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'health',
    label: 'Health & Medical',
    description: 'Scientific research, bio-hacking, and mental wellness.',
    icon: '🩺',
    color: 'from-cyan-600 to-sky-700'
  },
  {
    id: 'science',
    label: 'Science & Technology',
    description: 'Emerging tech, space exploration, and AI.',
    icon: '🔬',
    color: 'from-purple-600 to-fuchsia-700'
  }
];

export const FORMATS: string[] = ['Videos', 'Podcasts', 'Documentaries', 'News', 'Articles'];
