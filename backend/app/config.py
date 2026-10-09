import os

class Settings:
    def __init__(self):
        e = os.environ.get
        self.env = e("APP_ENV", "development")
        self.cors = [o.strip() for o in e("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
        self.mongo_uri, self.mongo_db = e("MONGODB_URI", ""), e("MONGODB_DB", "signalforge")
        self.database = e("DATABASE", "mongo" if self.mongo_uri else "memory")  # "memory" = local dev/tests only
        self.firebase_project = e("FIREBASE_PROJECT_ID", "")
        # Local-development bypass. Ignored when APP_ENV=production.
        self.auth_disabled = e("AUTH_DISABLED", "false") == "true" and self.env != "production"
        self.llm_key, self.llm_model = e("ANTHROPIC_API_KEY", ""), e("LLM_MODEL", "claude-sonnet-5-5")
        self.search_key = e("TAVILY_API_KEY", "")
        self.runs_per_hour = int(e("RATE_LIMIT_RUNS_PER_HOUR", "10"))

settings = Settings()
