const fs = require('fs');
let content = fs.readFileSync('app/(perusahaan)/jobs/new/page.tsx', 'utf8');

// Replace standard imports
content = content.replace(`import { useRouter, useSearchParams } from 'next/navigation';`, `import { useRouter, useParams } from 'next/navigation';`);

// Replace component name
content = content.replace('function CreateJobForm() {', 'function JobDetailView() {');
content = content.replace('export default function CreateJobPage() {', 'export default function JobDetailPage() {');
content = content.replace('<CreateJobForm />', '<JobDetailView />');

// Replace editId with jobId
content = content.replace(/const searchParams = useSearchParams\(\);\r?\n\s*const editId = searchParams\.get\('edit'\);/g, 'const params = useParams();\n  const jobId = params.id as string;');
content = content.replace(/editId/g, 'jobId');
content = content.replace(/if \(!jobId\) return;/g, 'if (!jobId) return;');

// Disable inputs
content = content.replace(/<input /g, '<input disabled ');
content = content.replace(/<select /g, '<select disabled ');
content = content.replace(/<textarea /g, '<textarea disabled ');
content = content.replace(/onChange=\{.*?\}/g, '');
content = content.replace(/onKeyDown=\{.*?\}/g, '');

// Remove all buttons except Back and Edit
content = content.replace(/<button[^>]*onClick=\{handleRemove[^>]*>[\s\S]*?<\/button>/g, '');
content = content.replace(/<button[^>]*onClick=\{handleAdd[^>]*>[\s\S]*?<\/button>/g, '');
content = content.replace(/<button[^>]*onClick=\{[^}]*toggleBenefit[^}]*\}[^>]*>([\s\S]*?)<\/button>/g, '<div className={`p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${isSelected ? "bg-primary/10 border-primary text-primary shadow-sm" : "bg-muted/20 border-border text-muted-foreground"}`}>$1</div>');
content = content.replace(/<button[^>]*onClick=\{\(\) => handleRemoveKeyword[^>]*>[\s\S]*?<\/button>/g, '');

// Remove inputs for adding new items
content = content.replace(/<input disabled [^>]*value=\{newResp\}[^>]*\/>/g, '');
content = content.replace(/<input disabled [^>]*value=\{newReq\}[^>]*\/>/g, '');
content = content.replace(/<input disabled [^>]*value=\{keywordInput\}[^>]*\/>/g, '');
content = content.replace(/<input disabled [^>]*value=\{newQuestion\}[^>]*\/>/g, '');

// Cut the footer and modals
let footerIndex = content.indexOf('{/* Sticky Action Footer Bar */}');
if (footerIndex !== -1) {
  content = content.substring(0, footerIndex);
  
  content += `        {/* Sticky Action Footer Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border py-4 px-6 shadow-xl">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button 
              type="button"
              onClick={() => router.push('/jobs')}
              className="px-4 py-2.5 border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Kembali
            </button>

            <Link 
              href={\`/jobs/new?edit=\${jobId}\`}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md"
            >
              <Edit size={16} />
              Edit Lowongan
            </Link>
          </div>
        </div>

      </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse text-xs">Memuat data form...</div>}>
      <JobDetailView />
    </Suspense>
  );
}`;
}

// Fix header
content = content.replace(/\{jobId \? 'Edit Lowongan' : t\.jobs\.title\}/g, '{jobTitle || "Detail Lowongan"}');
content = content.replace(/\{jobId \? 'Perbarui informasi lowongan Anda\.' : t\.jobs\.subtitle\}/g, '"Detail lengkap mengenai lowongan pekerjaan ini."');
content = content.replace(/<form onSubmit=\{handlePublish\}/g, '<div');
content = content.replace(/<\/form>/g, '</div>');

// Ensure Edit icon is imported
if (!content.includes('Edit,')) {
  content = content.replace('ArrowLeft,', 'ArrowLeft, Edit,');
}

fs.writeFileSync('app/(perusahaan)/jobs/[id]/page.tsx', content);
console.log('Transformation complete!');
