FROM python:3.13-slim
WORKDIR /app
COPY p120_worker_bundle.b64 /tmp/p120_worker_bundle.b64
COPY tail_00.b64 /tmp/tail_00.b64
COPY tail_01.b64 /tmp/tail_01.b64
COPY tail_02.b64 /tmp/tail_02.b64
COPY tail_03.b64 /tmp/tail_03.b64
COPY tail_04.b64 /tmp/tail_04.b64
COPY control_00.b64 /tmp/control_00.b64
COPY control_01.b64 /tmp/control_01.b64
COPY control_02.b64 /tmp/control_02.b64
COPY control_03.b64 /tmp/control_03.b64
COPY report_00.b64 /tmp/report_00.b64
COPY report_01.b64 /tmp/report_01.b64
COPY report_02.b64 /tmp/report_02.b64
COPY interp_00.b64 /tmp/p120_worker_interpretation.b64
COPY compat_patch.py /tmp/compat_patch.py
COPY renderer_compat_patch.py /tmp/renderer_compat_patch.py
COPY composer_diag.py /tmp/composer_diag.py
RUN set -eux; \
    base64 -d --ignore-garbage /tmp/p120_worker_bundle.b64 > /tmp/p120_worker_partial.tgz; \
    mkdir -p /app; \
    tar -xzf /tmp/p120_worker_partial.tgz -C /app || true; \
    cat /tmp/tail_00.b64 /tmp/tail_01.b64 /tmp/tail_02.b64 /tmp/tail_03.b64 /tmp/tail_04.b64 > /tmp/p120_worker_tail.b64; \
    base64 -d /tmp/p120_worker_tail.b64 > /tmp/p120_worker_tail.tgz; \
    echo '4028574841eaac2d8e7ab436b6648d612aae63995a47072f1ec0e6a4aaa614f0  /tmp/p120_worker_tail.tgz' | sha256sum -c -; \
    tar -xzf /tmp/p120_worker_tail.tgz -C /app; \
    cat /tmp/control_00.b64 /tmp/control_01.b64 /tmp/control_02.b64 /tmp/control_03.b64 > /tmp/p120_worker_control.b64; \
    base64 -d /tmp/p120_worker_control.b64 > /tmp/p120_worker_control.tgz; \
    echo '7e0e3124ccc43a0badc47fdd95aac595e99ffc6b372e9c1aaae7361e0cf2b426  /tmp/p120_worker_control.tgz' | sha256sum -c -; \
    tar -xzf /tmp/p120_worker_control.tgz -C /app; \
    cat /tmp/report_00.b64 /tmp/report_01.b64 /tmp/report_02.b64 > /tmp/p120_worker_report.b64; \
    base64 -d /tmp/p120_worker_report.b64 > /tmp/p120_worker_report.tgz; \
    echo '3f2662dcbb04dde73e6cde51e7912670e736d028f1172d1b96a1d7c8494830bd  /tmp/p120_worker_report.tgz' | sha256sum -c -; \
    tar -xzf /tmp/p120_worker_report.tgz -C /app; \
    base64 -d /tmp/p120_worker_interpretation.b64 > /tmp/p120_worker_interpretation.tgz; \
    echo 'fa5fd4a51ef9bd2e9860fa83acaa19443769b9c8977ad4366c9cdfd08c8509a3  /tmp/p120_worker_interpretation.tgz' | sha256sum -c -; \
    tar -xzf /tmp/p120_worker_interpretation.tgz -C /app; \
    python /tmp/compat_patch.py; \
    python /tmp/renderer_compat_patch.py; \
    python /tmp/composer_diag.py; \
    python -m py_compile /app/e2e_runner.py /app/p120_release/renderer.py; \
    echo '=== P120 E2E PACKAGING MANIFEST START ==='; \
    find /app -maxdepth 7 -type f | sort; \
    echo '=== P120 E2E PACKAGING MANIFEST END ==='; \
    for f in \
      /app/e2e_runner.py \
      /app/runtime_service/pipeline.py \
      /app/p120_engine/engine.py \
      /app/p120_interpretation/claims.py \
      /app/p120_interpretation/definitions.py \
      /app/p120_interpretation/evidence.py \
      /app/p120_interpretation/payload.py \
      /app/p120_interpretation/runtime.py \
      /app/p120_interpretation/schema.py \
      /app/p120_interpretation/util.py \
      /app/p120_interpretation/validator.py \
      /app/p120_report/composer.py \
      /app/p120_report/writer.py \
      /app/p120_report/validator.py \
      /app/p120_release/release.py \
      /app/p120_release/renderer.py \
      /app/providers/openai_responses.py \
      /app/prompts/analytical-pass.developer.v0.5.txt \
      /app/prompts/human-language.developer.v0.6.txt \
      /app/prompts/literary.developer.v0.6.txt \
      /app/prompts/semantic-alignment.developer.v0.7.txt \
      /app/baseline_v0.7/baseline_v0.6/baseline_v0.5/registries/model-routing-registry.v0.5.json \
      /app/baseline_v0.7/baseline_v0.6/registries/report-writer-routing-registry.v0.6.json \
      /app/baseline_v0.7/registries/semantic-alignment-registry.v0.7.json; do \
        if [ -f "$f" ]; then echo "PACKAGING_ASSERT PASS $f"; else echo "PACKAGING_ASSERT FAIL $f"; exit 41; fi; \
    done; \
    rm -f /tmp/p120_worker_*.b64 /tmp/p120_worker_*.tgz /tmp/tail_*.b64 /tmp/control_*.b64 /tmp/report_*.b64 /tmp/compat_patch.py /tmp/renderer_compat_patch.py /tmp/composer_diag.py; \
    pip install --no-cache-dir "jsonschema>=4.20,<5"
ENV PYTHONUNBUFFERED=1
CMD ["python","e2e_runner.py"]
