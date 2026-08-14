import os

backend_path = "C:\\web_project\\backend-airecruitpro"
admin_py_path = os.path.join(backend_path, 'app', 'routers', 'admin.py')

with open(admin_py_path, 'r', encoding='utf-8') as f:
    admin_content = f.read()

if 'from app.models.setting import SystemSetting' not in admin_content:
    # Add imports
    admin_content = admin_content.replace('from app.models import User, Job, Application', 'from app.models import User, Job, Application\nfrom app.models.setting import SystemSetting\nimport json')
    
    # Append the endpoints
    endpoints = """
# ============================================
# SYSTEM SETTINGS ENDPOINTS
# ============================================

@router.get("/settings")
def get_system_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    settings = db.query(SystemSetting).all()
    result = {}
    for s in settings:
        try:
            result[s.key] = json.loads(s.value)
        except:
            result[s.key] = s.value
            
    # Default values if not set
    defaults = {
        "maintenance_mode": False,
        "seo_title": "AI Recruit Pro",
        "seo_description": "Platform Rekrutmen Cerdas Berbasis AI",
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_user": "",
        "smtp_pass": "",
        "smtp_from": ""
    }
    
    for k, v in defaults.items():
        if k not in result:
            result[k] = v
            
    return result

@router.put("/settings")
def update_system_settings(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    import asyncio
    
    # Ensure it's async read
    async def get_json():
        return await request.json()
        
    import nest_asyncio
    nest_asyncio.apply()
    
    loop = asyncio.get_event_loop()
    data = loop.run_until_complete(get_json())
    
    for key, value in data.items():
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        val_str = json.dumps(value) if not isinstance(value, str) else value
        if setting:
            setting.value = val_str
        else:
            new_setting = SystemSetting(key=key, value=val_str)
            db.add(new_setting)
            
    db.commit()
    return {"message": "Pengaturan sistem berhasil disimpan"}
"""
    # Fix the async reading in FastAPI if we use Request directly. Actually we can just use `data: dict = Body(...)`
    # Let's replace the endpoint with a simpler one:
    endpoints = """
# ============================================
# SYSTEM SETTINGS ENDPOINTS
# ============================================
from fastapi import Body

@router.get("/settings")
def get_system_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    settings = db.query(SystemSetting).all()
    result = {}
    for s in settings:
        try:
            val = json.loads(s.value)
            # if boolean stored as string "true" or "false"
            if isinstance(val, str) and val.lower() == "true":
                val = True
            elif isinstance(val, str) and val.lower() == "false":
                val = False
            result[s.key] = val
        except:
            val = s.value
            if isinstance(val, str) and val.lower() == "true":
                val = True
            elif isinstance(val, str) and val.lower() == "false":
                val = False
            result[s.key] = val
            
    # Default values if not set
    defaults = {
        "maintenance_mode": False,
        "seo_title": "AI Recruit Pro",
        "seo_description": "Platform Rekrutmen Cerdas Berbasis AI",
        "smtp_host": "",
        "smtp_port": "587",
        "smtp_user": "",
        "smtp_pass": "",
        "smtp_from": ""
    }
    
    for k, v in defaults.items():
        if k not in result:
            result[k] = v
            
    return result

@router.put("/settings")
def update_system_settings(data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    for key, value in data.items():
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        val_str = json.dumps(value)
        if setting:
            setting.value = val_str
        else:
            new_setting = SystemSetting(key=key, value=val_str)
            db.add(new_setting)
            
    db.commit()
    return {"message": "Pengaturan sistem berhasil disimpan"}
"""
    with open(admin_py_path, 'a', encoding='utf-8') as f:
        f.write(endpoints)

print('Admin settings APIs added!')
