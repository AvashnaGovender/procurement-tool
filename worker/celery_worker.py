"""Celery worker configuration and startup script."""
from celery import Celery
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    'procurement_worker',
    broker=settings.redis_url,
    backend=settings.redis_url
)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour timeout
    worker_concurrency=settings.worker_concurrency,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_disable_rate_limits=True
)

# Import tasks to register them
from tasks import process_supplier_submission, health_check

if __name__ == '__main__':
    # Start Celery worker
    celery_app.worker_main([
        'worker',
        '--loglevel=info',
        '--concurrency=4',
        '--queues=default'
    ])

