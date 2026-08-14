import os

backend_path = "C:\\web_project\\backend-airecruitpro"

# 1. Create app/models/setting.py
with open(os.path.join(backend_path, 'app', 'models', 'setting.py'), 'w') as f:
    f.write("""from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
""")

# 2. Modify app/models/__init__.py
init_path = os.path.join(backend_path, 'app', 'models', '__init__.py')
with open(init_path, 'r') as f:
    init_content = f.read()
if 'from .setting import SystemSetting' not in init_content:
    with open(init_path, 'a') as f:
        f.write('\nfrom .setting import SystemSetting\n')

# 3. Create app/routers/config.py
with open(os.path.join(backend_path, 'app', 'routers', 'config.py'), 'w') as f:
    f.write("""from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json
from app.core.database import get_db
from app.models.setting import SystemSetting

router = APIRouter()

@router.get("/public")
def get_public_config(db: Session = Depends(get_db)):
    keys = ["maintenance_mode", "seo_title", "seo_description"]
    settings = db.query(SystemSetting).filter(SystemSetting.key.in_(keys)).all()
    
    config = {
        "maintenance_mode": False,
        "seo_title": "AI Recruit Pro",
        "seo_description": "Platform Rekrutmen Cerdas Berbasis AI"
    }
    
    for s in settings:
        try:
            val = json.loads(s.value)
        except:
            val = s.value
        
        if s.key == "maintenance_mode":
            config["maintenance_mode"] = val == True or str(val).lower() == "true"
        else:
            config[s.key] = val
            
    return config
""")

# 4. Modify app/main.py to include config.py
main_path = os.path.join(backend_path, 'app', 'main.py')
with open(main_path, 'r', encoding='utf-8') as f:
    main_content = f.read()

if 'from app.routers import config' not in main_content and 'config.router' not in main_content:
    main_content = main_content.replace(
        'from app.routers import auth, users, jobs, applications, analysis, saved_jobs, admin, perusahaan',
        'from app.routers import auth, users, jobs, applications, analysis, saved_jobs, admin, perusahaan, config'
    )
    main_content = main_content.replace(
        'app.include_router(perusahaan.router, prefix="/api/perusahaan", tags=["Perusahaan"])',
        'app.include_router(perusahaan.router, prefix="/api/perusahaan", tags=["Perusahaan"])\napp.include_router(config.router, prefix="/api/config", tags=["Config"])'
    )
    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(main_content)

print('Backend files created successfully!')
