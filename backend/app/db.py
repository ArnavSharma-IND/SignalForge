import time
from .config import settings

class MemoryRepo:  # local dev / tests only
    def __init__(self): self.d = {}
    async def init(self): pass
    async def close(self): pass
    async def ready(self): return True
    async def create(self, doc): self.d[doc["_id"]] = doc; return doc
    async def get(self, id, owner=None):
        x = self.d.get(id); return dict(x) if x and (owner is None or x["owner"] == owner) else None
    async def list(self, owner, skip, limit):
        r = sorted((x for x in self.d.values() if x["owner"] == owner), key=lambda x: -x["created"])
        return [{k: v for k, v in x.items() if k != "data"} for x in r[skip:skip + limit]]
    async def touch(self, id, f): self.d[id].update(f)
    async def transition(self, id, frm, to):
        x = self.d.get(id)
        if not x or x["status"] not in frm: return None
        x.update(status=to, updated=time.time()); return dict(x)
    async def delete(self, id, owner):
        x = self.d.get(id)
        if x and x["owner"] == owner: del self.d[id]; return True
        return False
    async def delete_owner(self, owner):
        for k in [k for k, x in self.d.items() if x["owner"] == owner]: del self.d[k]
    async def stale(self, before): return [k for k, x in self.d.items() if x["status"] in ("queued", "running") and x["updated"] < before]

class MongoRepo:
    def __init__(self, uri, db):
        from motor.motor_asyncio import AsyncIOMotorClient
        self.c = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        self.col = self.c[db]["investigations"]
    async def init(self):
        await self.col.create_index([("owner", 1), ("created", -1)])
        await self.col.create_index([("status", 1), ("updated", 1)])
    async def close(self): self.c.close()
    async def ready(self):
        try: await self.c.admin.command("ping"); return True
        except Exception: return False
    async def create(self, doc): await self.col.insert_one(doc); return doc
    async def get(self, id, owner=None):
        return await self.col.find_one({"_id": id, **({"owner": owner} if owner else {})})
    async def list(self, owner, skip, limit):
        return await self.col.find({"owner": owner}, {"data": 0}).sort("created", -1).skip(skip).limit(limit).to_list(limit)
    async def touch(self, id, f): await self.col.update_one({"_id": id}, {"$set": f})
    async def transition(self, id, frm, to):
        return await self.col.find_one_and_update({"_id": id, "status": {"$in": frm}}, {"$set": {"status": to, "updated": time.time()}}, return_document=True)
    async def delete(self, id, owner): return (await self.col.delete_one({"_id": id, "owner": owner})).deleted_count == 1
    async def delete_owner(self, owner): await self.col.delete_many({"owner": owner})
    async def stale(self, before):
        return [x["_id"] async for x in self.col.find({"status": {"$in": ["queued", "running"]}, "updated": {"$lt": before}}, {"_id": 1})]

def make_repo():
    return MongoRepo(settings.mongo_uri, settings.mongo_db) if settings.database == "mongo" else MemoryRepo()
