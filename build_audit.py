import os

backend_path = 'C:\\web_project\\backend-airecruitpro'

# 1. Create app/models/audit.py
audit_model_content = """from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.sql import func
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    action = Column(String, index=True)
    user_id = Column(String, nullable=True, index=True)
    user_name = Column(String, nullable=True)
    details = Column(String, nullable=True) # store JSON as string
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
"""
with open(os.path.join(backend_path, 'app', 'models', 'audit.py'), 'w', encoding='utf-8') as f:
    f.write(audit_model_content)

# 2. Modify app/models/__init__.py
init_path = os.path.join(backend_path, 'app', 'models', '__init__.py')
with open(init_path, 'r', encoding='utf-8') as f:
    init_content = f.read()
if 'from .audit import AuditLog' not in init_content:
    with open(init_path, 'a', encoding='utf-8') as f:
        f.write('\nfrom .audit import AuditLog\n')

# 3. Create app/services/audit_service.py
audit_service_content = """from sqlalchemy.ext.asyncio import AsyncSession
import json
from app.models.audit import AuditLog

async def log_audit(db: AsyncSession, action: str, user_id: str = None, user_name: str = None, details: dict = None, ip_address: str = None):
    try:
        details_str = json.dumps(details) if details else None
        new_log = AuditLog(
            action=action,
            user_id=user_id,
            user_name=user_name,
            details=details_str,
            ip_address=ip_address
        )
        db.add(new_log)
        await db.commit()
    except Exception as e:
        print(f"Failed to write audit log: {e}")
        await db.rollback()
"""
os.makedirs(os.path.join(backend_path, 'app', 'services'), exist_ok=True)
with open(os.path.join(backend_path, 'app', 'services', 'audit_service.py'), 'w', encoding='utf-8') as f:
    f.write(audit_service_content)

# 4. Modify app/routers/admin.py to add GET /api/admin/audit-logs
admin_path = os.path.join(backend_path, 'app', 'routers', 'admin.py')
with open(admin_path, 'r', encoding='utf-8') as f:
    admin_content = f.read()

if '@router.get("/audit-logs")' not in admin_content:
    if 'from app.models.audit import AuditLog' not in admin_content:
        admin_content = admin_content.replace('from app.models.setting import SystemSetting', 'from app.models.setting import SystemSetting\nfrom app.models.audit import AuditLog')
    
    audit_endpoints = """
# ============================================
# AUDIT LOGS ENDPOINTS
# ============================================
@router.get("/audit-logs")
async def get_audit_logs(db: AsyncSession = Depends(get_db), current_user: dict = Depends(verify_admin), limit: int = 100):
    from sqlalchemy import select
    result_query = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
    logs = result_query.scalars().all()
    
    formatted_logs = []
    for log in logs:
        try:
            details_json = json.loads(log.details) if log.details else {}
        except:
            details_json = log.details
            
        formatted_logs.append({
            "id": log.id,
            "action": log.action,
            "user_id": log.user_id,
            "user_name": log.user_name,
            "details": details_json,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        })
    return formatted_logs
"""
    with open(admin_path, 'a', encoding='utf-8') as f:
        f.write(audit_endpoints)

print('Backend audit files created successfully!')
