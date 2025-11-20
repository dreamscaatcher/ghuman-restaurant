# Deployment Guide

This document explains how to run the **Ghuman Restaurant** Next.js application behind Nginx with HTTPS certificates issued by Certbot. The stack targets local or self-managed Linux hosts with Docker available.

---

## 1. Prerequisites

- Docker Engine >= 24 and the Docker Compose plugin.
- A Linux host (or WSL2) with ports `80` and `443` open.
- A DNS record pointing your desired domain (e.g. `ghuman-restaurant.local` or a real hostname) to the server IP.
- Ability to run `certbot` and write to `/etc/letsencrypt` (Compose mounts `./certbot/conf` and `./certbot/www`).
- Copy `.env.example` to `.env.production`, then update values:

  ```bash
  cp .env.example .env.production
  # edit .env.production with the final public URL and secrets
  ```

---

## 2. Build and Test Containers

The repository includes a multi-stage `Dockerfile` that produces a production-ready Next.js image.

Build with Compose:

```bash
docker compose build web
```

Or build/run manually:

```bash
docker build -t ghuman-restaurant:latest .
docker run --rm -p 3000:3000 --env-file .env.production ghuman-restaurant:latest
```

---

## 3. Configure Nginx and Certificates

1. Update `deploy/nginx/conf.d/default.conf`:
   - Replace every `ghuman-restaurant.local` with your real domain.
   - Confirm the `ssl_certificate` and `ssl_certificate_key` paths match the certificate names Certbot will create.

2. Issue the first certificate once DNS resolves. To cover the app, manager, and kitchen subdomains in one SAN certificate:

```bash
docker compose up -d nginx
docker compose run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  --email you@example.com \
  --agree-tos \
  --no-eff-email \
  -d your-domain.example \
  -d manager.your-domain.example \
  -d kitchen.your-domain.example
```

3. Validate the certificate files:

```bash
   docker run --rm \
     -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
     certbot/certbot \
     certbot certificates
   ```

4. Reload Nginx to serve HTTPS:

```bash
docker compose restart nginx
```

If you previously issued a certificate without `kitchen.your-domain.example`, rerun the `certonly` command above with all three `-d` flags to replace the certificate, then restart Nginx.

The `certbot` service in `docker-compose.yml` handles automatic renewals every 12 hours by sharing the same certificate volume with Nginx.

---

## 4. Start the Stack

```bash
docker compose up -d
```

Services:

- **web** – Next.js app running `node server.js` on port 3000 (internal).
- **nginx** – Reverse proxy terminating TLS, caching static assets, forwarding WebSockets.
- **certbot** – Optional renewal loop; keep enabled for unattended certificate refresh.

Monitoring commands:

```bash
docker compose ps
docker compose logs -f web
docker compose logs -f nginx
```

Smoke test:

```bash
curl -I https://your-domain.example
```

---

## 5. Maintenance Workflow

1. Deploy updates:
   ```bash
   git pull
   docker compose build web
   docker compose up -d web
   ```
2. Renew manually (if you disable the renewal container):
   ```bash
   docker compose run --rm certbot certbot renew
   docker compose exec nginx nginx -s reload
   ```
3. Back up the `certbot/conf` and `certbot/www` directories.
4. Consider system-level hardening (firewall, fail2ban, unattended upgrades).

---

## 6. GitHub Actions CI/CD

The repository now includes `.github/workflows/ci-cd.yml`. When enabled, it automates:

1. Running `npm ci`, `npm run lint`, and `npm run build` for every push/PR targeting `main`.
2. Building the Docker image (using the `runner` stage) and pushing it to GitHub Container Registry at `ghcr.io/<owner>/<repo>`.
3. Logging into your production server over SSH, pulling the freshly published image, and restarting the `web` service with `docker compose up -d web`.

### One-time setup

- Provision a clone of this repository on the server (e.g. `/opt/ghuman-restaurant`) and make sure Docker + Docker Compose V2 are installed.
- Create a Personal Access Token (classic) with at least `read:packages` scope and save it for CI/CD as well as for the remote server to pull from GHCR.
- Add these GitHub repository secrets:
  - `SSH_HOST` – production server address.
  - `SSH_PORT` – optional SSH port (defaults to `22`).
  - `SSH_USERNAME` – Linux user with permission to run Docker.
  - `SSH_PRIVATE_KEY` – private key that matches an authorized key on the server.
  - `DEPLOY_PATH` – absolute path of the clone on the server (where `docker-compose.yml` lives).
  - `REGISTRY_USERNAME` – GitHub username (or service account) that the server uses for `docker login`.
  - `REGISTRY_TOKEN` – PAT with `read:packages` scope for the above user.

The workflow already has permission to push images with `${{ secrets.GITHUB_TOKEN }}`; the extra registry credentials are only used on the server when it executes `docker compose pull web`.

### Deploying

- Push to `main`. After the workflow succeeds the server will be running the new tag `ghcr.io/<owner>/<repo>:<commit-sha>`.
- You can override the image manually if needed: `WEB_IMAGE=ghcr.io/<owner>/<repo>:latest docker compose up -d web`.
- If you change reverse-proxy files (e.g. `deploy/nginx/*`) remember to update the clone on the server (`git pull`) so Nginx sees the new config; the workflow only redeploys containers.

## 7. Future Extensions

- Add Neo4j and Redis services to `docker-compose.yml` when backend integration begins.
- Push the `web` image to a private registry and reference it via the `image:` field for consistent deployments across environments.
- Integrate log shipping or monitoring (e.g. Promtail, Loki, or a managed service) for long-running installations.

You now have a reproducible baseline deployment that can be promoted before layering additional features.
