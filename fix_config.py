import os

backend_path = 'C:\\web_project\\backend-airecruitpro'
config_path = os.path.join(backend_path, 'app', 'routers', 'config.py')

content = """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
from app.core.database import get_db
from app.models.setting import SystemSetting

router = APIRouter()

@router.get("/public")
async def get_public_config(db: AsyncSession = Depends(get_db)):
    keys = ["maintenance_mode", "seo_title", "seo_description"]
    result = await db.execute(select(SystemSetting).where(SystemSetting.key.in_(keys)))
    settings = result.scalars().all()
    
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
"""

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('config.py updated with async!')
