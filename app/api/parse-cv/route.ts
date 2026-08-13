import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv_file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text || '';

    // Clean text for robust matching
    const noSpaceText = rawText.replace(/\s+/g, '');
    const phoneCleanText = rawText.replace(/[\s\-\(\)]/g, '');

    // Regex extractors
    const emailMatch = noSpaceText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    const phoneMatch = phoneCleanText.match(/(?:\+62|62|0)8[1-9][0-9]{6,10}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    const linkedinMatch = noSpaceText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const linkedinUrl = linkedinMatch ? linkedinMatch[0] : '';

    // Heuristics for Full Name (first clean alphabetic line)
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let fullName = '';
    for (const line of lines) {
      if (/^[A-Z][a-zA-Z\s]{3,40}$/.test(line) && line.split(' ').length <= 4) {
        fullName = line;
        break;
      }
    }

    // Heuristics for Skills
    const commonSkills = ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Tailwind', 'Python', 'Java', 'SQL', 'Git', 'Figma', 'UI/UX'];
    const detectedSkills = commonSkills.filter(skill => new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(rawText));
    const skills = detectedSkills.join(', ');

    return NextResponse.json({
      success: true,
      data: {
        fullName,
        email,
        phone,
        linkedinUrl,
        skills,
        rawText
      }
    });

  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: 'Failed to parse PDF file', details: error.message, stack: error.stack }, { status: 500 });
  }
}
