import os

backend_path = 'C:\\web_project\\backend-airecruitpro'
admin_py_path = os.path.join(backend_path, 'app', 'routers', 'admin.py')

with open(admin_py_path, 'r', encoding='utf-8') as f:
    admin_content = f.read()

# Make sure we have audit_service imported
if 'from app.services.audit_service import log_audit' not in admin_content:
    admin_content = admin_content.replace('from app.models.audit import AuditLog', 'from app.models.audit import AuditLog\nfrom app.services.audit_service import log_audit')

# Inject log_audit into admin_create_category
target_code = """    new_cat = JobCategory(nama_kategori=req.nama_kategori, deskripsi=req.deskripsi)
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)"""

replacement_code = """    new_cat = JobCategory(nama_kategori=req.nama_kategori, deskripsi=req.deskripsi)
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)
    
    # Audit Log
    admin_id = current_user.get("id") if isinstance(current_user, dict) else current_user.id
    admin_name = current_user.get("nama_lengkap") if isinstance(current_user, dict) else current_user.nama_lengkap
    await log_audit(db, action="CREATE_CATEGORY", user_id=admin_id, user_name=admin_name, details={"category_id": new_cat.id, "category_name": new_cat.nama_kategori})
"""

admin_content = admin_content.replace(target_code, replacement_code)

# Inject into update settings
target_settings = """    await db.commit()
    return {"message": "Pengaturan sistem berhasil disimpan"}"""
    
replacement_settings = """    await db.commit()
    
    # Audit Log
    admin_id = current_user.get("id") if isinstance(current_user, dict) else current_user.id
    admin_name = current_user.get("nama_lengkap") if isinstance(current_user, dict) else current_user.nama_lengkap
    await log_audit(db, action="UPDATE_SYSTEM_SETTINGS", user_id=admin_id, user_name=admin_name, details={"updated_keys": list(data.keys())})
    
    return {"message": "Pengaturan sistem berhasil disimpan"}"""

admin_content = admin_content.replace(target_settings, replacement_settings)

with open(admin_py_path, 'w', encoding='utf-8') as f:
    f.write(admin_content)
print('Added log triggers in admin.py!')
