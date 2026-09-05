FROM python:3.13-slim
WORKDIR /app
COPY p120_worker_bundle.b64 /tmp/p120_worker_bundle.b64
RUN base64 -d --ignore-garbage /tmp/p120_worker_bundle.b64 > /tmp/p120_worker_bundle.tgz \
 && tar -tzf /tmp/p120_worker_bundle.tgz >/dev/null \
 && tar -xzf /tmp/p120_worker_bundle.tgz -C /app \
 && rm /tmp/p120_worker_bundle.b64 /tmp/p120_worker_bundle.tgz \
 && pip install --no-cache-dir "jsonschema>=4.20,<5"
ENV PYTHONUNBUFFERED=1
CMD ["python","e2e_runner.py"]
