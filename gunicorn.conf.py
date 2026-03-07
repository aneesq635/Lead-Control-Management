# gunicorn.conf.py
# Production Gunicorn configuration for AI Brain Module

import multiprocessing

# ── Server socket ─────────────────────────────────────────────────────────────
bind            = "0.0.0.0:5050"
backlog         = 2048

# ── Worker processes ──────────────────────────────────────────────────────────
# Each LLM call is I/O-bound — use 2x CPU cores + 1
workers         = multiprocessing.cpu_count() * 2 + 1
worker_class    = "sync"
worker_connections = 1000
timeout         = 120      # LLM calls can take up to ~30s; give headroom
keepalive       = 5

# ── Logging ───────────────────────────────────────────────────────────────────
accesslog       = "-"      # stdout
errorlog        = "-"      # stdout
loglevel        = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# ── Process naming ────────────────────────────────────────────────────────────
proc_name       = "ai_brain"

# ── Reload (dev only — disable in production) ─────────────────────────────────
reload          = False
