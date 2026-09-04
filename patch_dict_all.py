import re
from pathlib import Path

file_path = Path(r"C:\web_project\frontend-airecruitpro\lib\i18n\dictionaries.ts")
content = file_path.read_text(encoding="utf-8")

replacements = {
    # Indonesian
    "threshold: 'Ambang Batas: 60%'": "threshold: 'Standar Kelulusan: 60%'",
    "thresholdScore: 'Ambang Batas Pencocokan CV (PO-FIT)'": "thresholdScore: 'Standar Kelulusan CV'",
    "thresholdAI: 'Ambang Batas AI'": "thresholdAI: 'Standar Kelulusan Otomatis'",
    "thresholdHelp: 'Kandidat dengan skor Kemiripan Kosinus di bawah ambang batas ini akan otomatis gagal.'": "thresholdHelp: 'Kandidat dengan Skor Kecocokan di bawah standar ini akan otomatis gugur.'",
    "hasilAnalisisCV: 'Hasil Analisis CV (PO-FIT)'": "hasilAnalisisCV: 'Hasil Analisis CV'",
    "menungguScreening: 'Menunggu Penyaringan CV AI (PO-FIT)'": "menungguScreening: 'Menunggu Seleksi CV AI'",
    "deskripsiScreening: 'Membandingkan secara otomatis CV dengan deskripsi pekerjaan menggunakan Kemiripan Kosinus.'": "deskripsiScreening: 'Sistem AI secara otomatis mengevaluasi kecocokan profil kandidat dengan persyaratan lowongan.'",
    "cvScreeningResult: 'Hasil Penyaringan CV (PO-FIT)'": "cvScreeningResult: 'Hasil Seleksi CV'",
    "thresholdPassed: 'Lulus Ambang Batas (=60%)'": "thresholdPassed: 'Memenuhi Standar (>=60%)'",
    "thresholdFailed: 'Di Bawah Ambang Batas (<60%)'": "thresholdFailed: 'Tidak Memenuhi Standar (<60%)'",
    "sortRelevance: 'Relevansi (PO-FIT)'": "sortRelevance: 'Tingkat Kecocokan'",
    "poFitMatch: 'Kecocokan PO-FIT'": "poFitMatch: 'Skor Kesesuaian Profil'",
    "s2: 'Penyaringan CV (PO-FIT)'": "s2: 'Seleksi CV otomatis'",
    "cvAnalysisTitle: 'Tahap 2: Hasil Analisis CV (PO-FIT)'": "cvAnalysisTitle: 'Tahap 2: Hasil Analisis CV'",
    "passedThreshold: 'MEMENUHI AMBANG BATAS (Skor = 60%)'": "passedThreshold: 'MEMENUHI STANDAR KELULUSAN (Skor >= 60%)'",
    "failedThreshold: 'DI BAWAH AMBANG BATAS (Skor < 60%)'": "failedThreshold: 'TIDAK MEMENUHI STANDAR (Skor < 60%)'",
    "algoInfo: 'Algoritma Kemiripan Kosinus PO-FIT'": "algoInfo: 'Sistem Pencocokan Cerdas AI'",
    "cvNotes: 'Catatan Evaluasi CV AI PO-FIT:'": "cvNotes: 'Catatan Evaluasi CV oleh AI:'",
    "passedThresholdVideo: 'MEMENUHI AMBANG BATAS VIDEO (Skor = 60%)'": "passedThresholdVideo: 'MEMENUHI STANDAR WAWANCARA (Skor >= 60%)'",
    "failedThresholdVideo: 'DI BAWAH AMBANG BATAS VIDEO (Skor < 60%)'": "failedThresholdVideo: 'TIDAK MEMENUHI STANDAR WAWANCARA (Skor < 60%)'",
    "failedThreshold: 'Belum Memenuhi Ambang Batas (< 60%)'": "failedThreshold: 'Belum Memenuhi Standar Kelulusan (< 60%)'",
    
    # English
    "avgCosineSimilarity: 'Avg Cosine Similarity'": "avgCosineSimilarity: 'Average Match Score'",
    "threshold: 'Threshold: 60%'": "threshold: 'Passing Score: 60%'",
    "cosineSimilarity: 'Cosine Similarity'": "cosineSimilarity: 'Profile Match Score'",
    "thresholdScore: 'CV Match Threshold '": "thresholdScore: 'Minimum Passing Score'",
    "thresholdAI: 'AI Threshold'": "thresholdAI: 'Auto-Reject Minimum Score'",
    "thresholdHelp: 'Candidates with Cosine Similarity scores below this threshold will auto-fail.'": "thresholdHelp: 'Candidates who score below this standard will be automatically disqualified.'",
    "cosineSimilarity: 'Cosine Similarity Score'": "cosineSimilarity: 'AI Match Score'",
    "thresholdPassed: 'Passed Threshold (=60%)'": "thresholdPassed: 'Meets Requirement (>=60%)'",
    "thresholdFailed: 'Below Threshold (<60%)'": "thresholdFailed: 'Below Requirement (<60%)'",
    "poFitMatch: 'PO-FIT Match'": "poFitMatch: 'Overall Profile Match'",
    "passedThresholdVideo: 'PASSED VIDEO THRESHOLD (Score = 60%)'": "passedThresholdVideo: 'PASSED INTERVIEW STANDARD (Score >= 60%)'",
    "failedThresholdVideo: 'BELOW VIDEO THRESHOLD (Score < 60%)'": "failedThresholdVideo: 'FAILED INTERVIEW STANDARD (Score < 60%)'",
}

for old, new in replacements.items():
    content = content.replace(old, new)

file_path.write_text(content, encoding="utf-8")
print("Replaced all occurrences successfully.")
