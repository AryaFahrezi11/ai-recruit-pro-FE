import asyncio
import os
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, 'C:\\web_project\\backend-airecruitpro')

from app.core.database import async_session_maker
from app.models.setting import SystemSetting
from sqlalchemy import select

async def get_settings():
    async with async_session_maker() as session:
        result = await session.execute(select(SystemSetting))
        settings = result.scalars().all()
        for s in settings:
            print(f"{s.key} = {s.value}")
        if not settings:
            print("No settings found in DB.")

if __name__ == '__main__':
    asyncio.run(get_settings())
