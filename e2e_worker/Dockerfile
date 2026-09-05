FROM python:3.13-slim
WORKDIR /app
COPY p120_worker_bundle.b64 /tmp/p120_worker_bundle.b64
RUN set -eux; \
    base64 -d --ignore-garbage /tmp/p120_worker_bundle.b64 > /tmp/p120_worker_bundle.tgz; \
    sha256sum /tmp/p120_worker_bundle.tgz; \
    mkdir -p /app; \
    tar -xzf /tmp/p120_worker_bundle.tgz -C /app || true; \
    test -f /app/e2e_runner.py; \
    test -f /app/runtime_service/pipeline.py; \
    test -f /app/p120_engine/engine.py; \
    test -f /app/p120_interpretation/runtime.py; \
    test -f /app/p120_report/composer.py; \
    test -f /app/p120_release/release.py; \
    test -f /app/providers/openai_responses.py; \
    rm -f /tmp/p120_worker_bundle.b64 /tmp/p120_worker_bundle.tgz; \
    pip install --no-cache-dir "jsonschema>=4.20,<5"
ENV PYTHONUNBUFFERED=1
CMD ["python","e2e_runner.py"]
