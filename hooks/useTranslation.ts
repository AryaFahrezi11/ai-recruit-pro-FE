import { dictionaries, Dictionary, LanguageKey } from '@/lib/i18n/dictionaries';

export function useTranslation(): { t: Dictionary; language: LanguageKey } {
  const language: LanguageKey = 'id';
  
  const t: Dictionary = dictionaries['id'];

  return { t, language };
}
