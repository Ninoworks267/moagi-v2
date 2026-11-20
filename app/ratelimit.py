import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

# scope -> (max requests, window seconds)
LIMITS = {
    "login": (5, 60),
    "register": (3, 300),
}

_attempts: dict[str, deque] = defaultdict(deque)
_failures: dict[str, list[float]] = defaultdict(list)
_LOCK_AFTER = 5
_LOCK_SECONDS = 15 * 60


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(request: Request, scope: str) -> None:
    ip = _client_ip(request)
    key = f"{scope}:{ip}"
    now = time.time()
    max_requests, window = LIMITS.get(scope, (10, 60))
    bucket = _attempts[key]
    while bucket and bucket[0] < now - window:
        bucket.popleft()
    if len(bucket) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    bucket.append(now)


def record_failure(request: Request, scope: str) -> None:
    ip = _client_ip(request)
    key = f"{scope}:{ip}"
    now = time.time()
    _failures[key] = [t for t in _failures[key] if t > now - _LOCK_SECONDS]
    _failures[key].append(now)
    if len(_failures[key]) >= _LOCK_AFTER:
        raise HTTPException(status_code=429, detail="Account temporarily locked. Try again later.")


def clear_failures(request: Request, scope: str) -> None:
    ip = _client_ip(request)
    _failures.pop(f"{scope}:{ip}", None)