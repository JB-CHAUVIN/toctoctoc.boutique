#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Déploiement de TocTocToc.boutique vers le serveur de production
# Usage : ./scripts/deploy.sh
# Cible : rocky@149.202.79.205 — /home/rocky/projets/toctoctoc
# Process : PM2 (toctoctoc)
# =============================================================================

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
REMOTE_USER="rocky"
REMOTE_HOST="149.202.79.205"
REMOTE_DIR="/home/rocky/projets/toctoctoc"
PM2_APP_NAME="toctoctoc"
BRANCH="${1:-main}"

SSH="ssh ${REMOTE_USER}@${REMOTE_HOST}"

# ── Couleurs ──────────────────────────────────────────────────────────────────
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

info()    { echo -e "${GREEN}▶ $*${NC}"; }
warning() { echo -e "${YELLOW}⚠ $*${NC}"; }
error()   { echo -e "${RED}✗ $*${NC}"; exit 1; }

# ── Pré-vérifications locales ──────────────────────────────────────────────────
info "Vérification de la connexion SSH..."
$SSH "echo ok" > /dev/null 2>&1 || error "Impossible de se connecter à ${REMOTE_HOST}. Vérifiez votre clé SSH."

info "Vérification des modifications locales non committées..."
if [[ -n "$(git status --porcelain)" ]]; then
  warning "Des fichiers non committés existent localement. Ils ne seront PAS déployés."
fi

info "Branche déployée : ${BRANCH}"
LOCAL_COMMIT=$(git rev-parse --short HEAD)
info "Commit local : ${LOCAL_COMMIT}"

# ── Déploiement sur le serveur ────────────────────────────────────────────────
info "Connexion au serveur et déploiement..."

$SSH bash << ENDSSH
  set -euo pipefail

  echo "→ Répertoire : ${REMOTE_DIR}"
  cd "${REMOTE_DIR}" || { echo "Répertoire introuvable : ${REMOTE_DIR}"; exit 1; }

  echo "→ Fetch + reset sur ${BRANCH}..."
  git fetch origin
  git checkout "${BRANCH}"
  git reset --hard "origin/${BRANCH}"

  echo "→ Installation des dépendances (yarn --frozen-lockfile)..."
  yarn install --frozen-lockfile --ignore-engines

  echo "→ Génération du client Prisma..."
  npx prisma generate

  echo "→ Migration DB (prisma db push)..."
  npx prisma db push --accept-data-loss

  echo "→ Build Next.js..."
  yarn build

  echo "→ Redémarrage PM2 (${PM2_APP_NAME})..."
  if pm2 describe "${PM2_APP_NAME}" > /dev/null 2>&1; then
    pm2 reload "${PM2_APP_NAME}" --update-env
  else
    pm2 start yarn --name "${PM2_APP_NAME}" \
      --interpreter none \
      --env production \
      -- start -- -p 3800 -H 127.0.0.1
    pm2 save
  fi

  echo "→ Sauvegarde PM2..."
  pm2 save

  REMOTE_COMMIT=\$(git rev-parse --short HEAD)
  echo "✓ Déployé : \${REMOTE_COMMIT}"
ENDSSH

info "Déploiement terminé avec succès !"
info "Commit déployé : ${LOCAL_COMMIT}"
echo ""
echo -e "  ${YELLOW}Site principal :${NC}  https://toctoctoc.boutique"
echo -e "  ${YELLOW}PM2 app name   :${NC}  ${PM2_APP_NAME}"
echo ""
