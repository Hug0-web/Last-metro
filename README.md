## Déploiement staging

### Prérequis
- Accès au registry: `registry.gitlab.com/hug0-web/last-metro`
- Variables d'env: `.env.staging` (Compose) ou ConfigMap/Secret (K8s)
- Santé exposée sur `/health`

### Docker Compose
1. `docker login registry.gitlab.com/hug0-web/last-metro`
2. `docker compose -f docker-compose.staging.yml pull`
3. `docker compose -f docker-compose.staging.yml up -d`
4. **Logs**: `docker compose -f docker-compose.staging.yml logs -f app`

