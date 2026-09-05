FROM python:3.13-slim
WORKDIR /app
COPY p120_worker_bundle.b64 /tmp/p120_worker_bundle.b64
COPY tail_00.b64 /tmp/tail_00.b64
COPY tail_01.b64 /tmp/tail_01.b64
COPY tail_02.b64 /tmp/tail_02.b64
COPY tail_03.b64 /tmp/tail_03.b64
COPY tail_04.b64 /tmp/tail_04.b64
RUN set -eux; \
    base64 -d --ignore-garbage /tmp/p120_worker_bundle.b64 > /tmp/p120_worker_partial.tgz; \
    mkdir -p /app; \
    tar -xzf /tmp/p120_worker_partial.tgz -C /app || true; \
    cat /tmp/tail_00.b64 /tmp/tail_01.b64 /tmp/tail_02.b64 /tmp/tail_03.b64 /tmp/tail_04.b64 > /tmp/p120_worker_tail.b64; \
    base64 -d /tmp/p120_worker_tail.b64 > /tmp/p120_worker_tail.tgz; \
    echo '4028574841eaac2d8e7ab436b6648d612aae63995a47072f1ec0e6a4aaa614f0  /tmp/p120_worker_tail.tgz' | sha256sum -c -; \
    tar -xzf /tmp/p120_worker_tail.tgz -C /app; \
    test -f /app/e2e_runner.py; \
    test -f /app/runtime_service/pipeline.py; \
    test -f /app/p120_engine/engine.py; \
    test -f /app/p120_interpretation/runtime.py; \
    test -f /app/p120_report/composer.py; \
    test -f /app/p120_release/release.py; \
    test -f /app/providers/openai_responses.py; \
    test -f /app/prompts/analytical_pass.txt; \
    rm -f /tmp/p120_worker_*.b64 /tmp/p120_worker_*.tgz /tmp/tail_*.b64; \
    pip install --no-cache-dir "jsonschema>=4.20,<5"
ENV PYTHONUNBUFFERED=1
CMD ["python","e2e_runner.py"]
