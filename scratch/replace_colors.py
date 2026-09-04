import os

filepath = r"c:\ai-recruit-pro-FE\app\page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the "greenish" teal and cyan colors with corporate blue and slate
replacements = {
    "text-[#1b7b9e]": "text-[#0D3880]",
    "bg-[#1b7b9e]": "bg-[#0D3880]",
    "border-[#1b7b9e]": "border-[#0D3880]",
    "text-[#1D7FA1]": "text-[#2753F2]",
    "bg-[#1D7FA1]": "bg-[#2753F2]",
    "hover:bg-[#1D7FA1]": "hover:bg-[#2753F2]",
    "hover:text-[#1D7FA1]": "hover:text-[#2753F2]",
    
    "bg-[#F0F8FB]": "bg-slate-50",
    "border-[#C2E5EF]": "border-slate-200",
    "bg-[#E0F1F7]": "bg-slate-100",
    "border-[#B8E1ED]": "border-slate-300",
    "text-[#E0F1F7]": "text-white",
    
    # Also tone down the dark mode cyan colors to match the corporate style
    "dark:text-cyan-400": "dark:text-slate-200",
    "dark:text-cyan-300": "dark:text-white",
    "dark:border-cyan-500": "dark:border-slate-400",
    "ring-cyan-500/20": "ring-slate-400/20",
    "shadow-[#1b7b9e]/10": "shadow-[#0D3880]/10",
    "text-cyan-400": "text-slate-200",
    "text-cyan-300": "text-white",
    "dark:hover:text-cyan-300": "dark:hover:text-white",
    "dark:hover:border-cyan-500": "dark:hover:border-slate-300",
}

for old, new in replacements.items():
    content = content.replace(old, new)
    
# Change font weights from extrabold/black to bold/semibold globally for consistency
content = content.replace("font-extrabold", "font-bold")
content = content.replace("font-black", "font-bold")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Colors and fonts replaced successfully.")
