#!/bin/bash

# =====================================================
# Script de despliegue manual a Yachay
# =====================================================
# Este script construye el proyecto y lo sube al servidor Yachay
# Uso: ./deploy.sh
# =====================================================

set -e  # Detener si hay errores

echo "🚀 Iniciando proceso de despliegue..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración del servidor (cámbiala según tus necesidades)
SERVER_USER="d9d1o9e9"
SERVER_HOST="yl-kuelap.yachay.pe"
SERVER_PATH="/home/d9d1o9e9/public_html"  # Ajusta la ruta según tu hosting

echo -e "${BLUE}📦 Paso 1: Instalando dependencias...${NC}"
npm ci

echo -e "${BLUE}🔨 Paso 2: Construyendo proyecto para producción...${NC}"
npm run build

echo -e "${BLUE}📤 Paso 3: Subiendo archivos al servidor...${NC}"
# Usando rsync para transferencia eficiente
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env*' \
  dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

echo -e "${GREEN}✅ ¡Despliegue completado exitosamente!${NC}"
echo -e "${GREEN}🌐 Tu sitio está disponible en: https://siamsoftnotarios.com${NC}"
