import os

filepath = r'c:\web_project\backend-airecruitpro\app\routers\admin.py'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

imports_to_add = []
if "from app.models.job import JobPosting" not in content:
    imports_to_add.append("from app.models.job import JobPosting")
if "from app.models.application import Application" not in content:
    imports_to_add.append("from app.models.application import Application")
if "from datetime import datetime, timedelta, date" not in content:
    imports_to_add.append("from datetime import datetime, timedelta, date")

if imports_to_add:
    import_str = "\n".join(imports_to_add) + "\n"
    start_idx = content.find("from fastapi import")
    if start_idx != -1:
        content = content[:start_idx] + import_str + content[start_idx:]
    else:
        content = import_str + content


route_code = """
@router.get("/job-metrics")
async def get_job_metrics(current_user: dict = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    active_jobs_q = await db.execute(select(func.count(JobPosting.id)).where(JobPosting.status.in_(['published', 'active'])))
    active_jobs = active_jobs_q.scalar() or 0
    
    closed_jobs_q = await db.execute(select(func.count(JobPosting.id)).where(JobPosting.status == 'closed'))
    closed_jobs = closed_jobs_q.scalar() or 0
    
    total_apps_query = await db.execute(select(func.count(Application.id)))
    total_applications = total_apps_query.scalar() or 0

    seven_days_ago = datetime.now() - timedelta(days=6)
    seven_days_ago = seven_days_ago.replace(hour=0, minute=0, second=0, microsecond=0)
    
    apps_7d_q = await db.execute(
        select(Application.applied_at)
        .where(Application.applied_at >= seven_days_ago)
    )
    recent_apps = apps_7d_q.scalars().all()
    
    from collections import defaultdict
    counts_by_day = defaultdict(int)
    for dt in recent_apps:
        if dt:
            d_str = dt.strftime("%Y-%m-%d")
            counts_by_day[d_str] += 1
            
    today = date.today()
    trend_data = []
    for i in range(7):
        d = today - timedelta(days=6-i)
        d_str = str(d)
        trend_data.append({
            "date": d.strftime("%d %b"),
            "lamaran": counts_by_day.get(d_str, 0)
        })

    return {
        "activeJobs": active_jobs,
        "closedJobs": closed_jobs,
        "totalApplications": total_applications,
        "trend7Days": trend_data
    }
"""

if "/job-metrics" not in content:
    content += "\n" + route_code
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Berhasil menambahkan /job-metrics")
else:
    print("/job-metrics sudah ada")
