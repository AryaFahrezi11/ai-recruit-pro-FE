import { dictionaries, Dictionary, LanguageKey } from '@/lib/i18n/dictionaries';

export function useTranslation() {
  const language = 'id';
  
  const t = dictionaries['id'];

  return { t, language };
}
