import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export const renderSkillsText = (skillsStr: string | undefined): string => {
  if (!skillsStr) return '';
  try {
    const parsed = JSON.parse(skillsStr);
    if (Array.isArray(parsed)) {
      return parsed.filter(s => s.category || s.items).map(s => `${s.category}: ${s.items}`).join(', ');
    }
  } catch(e) {}
  return skillsStr;
};

export const ParseSkills = ({ skillsStr, fallbackText }: { skillsStr?: string, fallbackText?: string }) => {
  const { language } = useTranslation();
  const defaultFallback = language === 'id' ? 'Tidak ada skill tercantum' : 'No skills listed';
  const displayFallback = fallbackText || defaultFallback;

  if (!skillsStr) return <span className="text-slate-400 italic">{displayFallback}</span>;
  
  try {
    const parsed = JSON.parse(skillsStr);
    if (Array.isArray(parsed)) {
      return (
        <ul className="mt-1 space-y-1 list-disc pl-4 marker:text-slate-400 text-xs">
          {parsed.filter((s: any) => s.category || s.items).map((s: any, idx: number) => (
            <li key={idx}>
              <strong className="text-slate-800 dark:text-slate-200">{s.category}:</strong> {s.items}
            </li>
          ))}
        </ul>
      );
    }
  } catch(e) {}
  
  return <span>{skillsStr}</span>;
};
