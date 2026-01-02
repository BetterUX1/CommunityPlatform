SHELL := /bin/bash

NS := communityplatform
K8S := kubectl -n $(NS)

.PHONY: k8s-up k8s-down k8s-status logs-api pf-api pf-web migrate reset-db dev ingress

k8s-up:
	$(K8S) apply -f k8s/00-namespace.yaml
	$(K8S) apply -f k8s/10-postgres.yaml
	$(K8S) apply -f k8s/11-api-secret.yaml
	$(K8S) apply -f k8s/12-api-config.yaml
	$(K8S) apply -f k8s/20-api.yaml
	$(K8S) apply -f k8s/30-web.yaml
	@echo "✅ Applied manifests"

ingress:
	$(K8S) apply -f k8s/40-ingress-web.yaml
	$(K8S) apply -f k8s/41-ingress-api.yaml
	@echo "✅ Applied ingress"

migrate:
	-$(K8S) delete job migrate --ignore-not-found=true
	$(K8S) apply -f k8s/15-migrate-job.yaml

	@echo "⏳ Waiting for migrate pod to start..."
	@bash -lc '\
	SECS=0; \
	while true; do \
	  POD=$$($(K8S) get pods -l job-name=migrate -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true); \
	  if [ -n "$$POD" ]; then \
	    PHASE=$$($(K8S) get pod $$POD -o jsonpath="{.status.phase}" 2>/dev/null || true); \
	    echo "migrate pod: $$POD ($$PHASE)"; \
	    if [ "$$PHASE" = "Running" ] || [ "$$PHASE" = "Succeeded" ] || [ "$$PHASE" = "Failed" ]; then \
	      break; \
	    fi; \
	  fi; \
	  sleep 1; \
	  SECS=$$((SECS+1)); \
	  if [ $$SECS -ge 120 ]; then \
	    echo "❌ Timed out waiting for migrate pod"; \
	    exit 1; \
	  fi; \
	done'

	@echo "📜 migrate logs:"
	@$(K8S) logs -f job/migrate || true

	@echo "✅ Waiting for job completion..."
	@$(K8S) wait --for=condition=complete job/migrate --timeout=180s

k8s-status:
	$(K8S) get pods
	$(K8S) get svc
	$(K8S) get ingress

logs-api:
	$(K8S) logs -f deploy/api

pf-api:
	$(K8S) port-forward svc/api 3000:3000

pf-web:
	$(K8S) port-forward svc/web 8080:80

reset-db:
	# ⚠️ tar bort all data i postgres (PVC)
	-$(K8S) delete deploy db --ignore-not-found=true
	-$(K8S) delete sts db --ignore-not-found=true
	-$(K8S) delete svc db --ignore-not-found=true
	-$(K8S) delete pvc pgdata --ignore-not-found=true
	$(K8S) apply -f k8s/10-postgres.yaml
	@echo "✅ DB reset (PVC recreated)"

k8s-down:
	-$(K8S) delete -f k8s/41-ingress-api.yaml --ignore-not-found=true
	-$(K8S) delete -f k8s/40-ingress-web.yaml --ignore-not-found=true
	-$(K8S) delete -f k8s/30-web.yaml --ignore-not-found=true
	-$(K8S) delete -f k8s/20-api.yaml --ignore-not-found=true
	-$(K8S) delete -f k8s/12-api-config.yaml --ignore-not-found=true
	-$(K8S) delete -f k8s/11-api-secret.yaml --ignore-not-found=true
	-$(K8S) delete -f k8s/10-postgres.yaml --ignore-not-found=true
	@echo "🧹 Removed app resources (namespace kept)"

dev: k8s-up ingress
	@echo "🚀 Starting dev loop…"
	@echo "1) Running migrations"
	@$(MAKE) migrate
	@echo "2) Waiting for api/web rollout"
	@$(K8S) rollout status deploy/api
	@$(K8S) rollout status deploy/web
	@echo "✅ Ready!"
	@echo "Open: http://web.localtest.me"
	@echo "API:  http://web.localtest.me/api/health/ready"

.PHONY: build build-api build-web restart restart-api restart-web redeploy redeploy-api redeploy-web

build:
	docker compose build

TAG ?= v3

build-api:
	docker build -t communityplatform-api:$(TAG) -f apps/api/Dockerfile .

redeploy-api: build-api
	kubectl -n $(NS) rollout restart deploy/api
	kubectl -n $(NS) rollout status deploy/api

build-web:
	docker compose build web

restart:
	$(K8S) rollout restart deploy/api
	$(K8S) rollout restart deploy/web
	$(K8S) rollout status deploy/api
	$(K8S) rollout status deploy/web

restart-api:
	$(K8S) rollout restart deploy/api
	$(K8S) rollout status deploy/api

restart-web:
	$(K8S) rollout restart deploy/web
	$(K8S) rollout status deploy/web

redeploy: build restart routes

redeploy-web: build-web restart-web

.PHONY: routes routes-api

routes:
	@$(K8S) logs deploy/api --tail=300 | grep -E "Mapped|RoutesResolver|RouterExplorer" || true

routes-api:
	@$(K8S) logs deploy/api --tail=300 | grep -E "Mapped|RoutesResolver|RouterExplorer" || true