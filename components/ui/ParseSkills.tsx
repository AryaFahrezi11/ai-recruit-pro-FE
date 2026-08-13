import React from 'react';

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

export const ParseSkills = ({ skillsStr, fallbackText = 'Tidak ada skill tercantum' }: { skillsStr?: string, fallbackText?: string }) => {
  if (!skillsStr) return <span className="text-slate-400 italic">{fallbackText}</span>;
  
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
