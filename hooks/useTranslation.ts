import { useAppStore } from '@/lib/store/useAppStore';
import { dictionaries, Dictionary, LanguageKey } from '@/lib/i18n/dictionaries';

export function useTranslation() {
  const language = useAppStore((state) => state.language);
  
  // A helper to get nested properties based on a string path
  // Since our dictionary is mostly 2 levels deep, a simpler approach is fine for now, 
  // but we can just return the whole dictionary for typed access.
  const t = dictionaries[language as LanguageKey] || dictionaries['id'];

  return { t, language };
}
