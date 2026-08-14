import os
import re

def search_otp(path):
    for root, dirs, files in os.walk(path):
        if 'node_modules' in root or '.venv' in root or '__pycache__' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        for i, line in enumerate(lines):
                            if 'otp' in line.lower():
                                print(f"{filepath}:{i+1}: {line.strip()}")
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

search_otp('C:\\web_project\\backend-airecruitpro\\app')
