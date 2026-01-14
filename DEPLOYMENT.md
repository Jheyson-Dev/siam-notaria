# 🚀 Guía de Despliegue CI/CD - Yachay Hosting

## 📋 Resumen

Este proyecto está configurado para desplegarse automáticamente en Yachay hosting usando GitHub Actions cada vez que se hace push a la rama `main`.

---

## ⚙️ Configuración Inicial (Solo una vez)

### 1️⃣ Generar Llave SSH para el Servidor

En tu máquina local, genera una llave SSH:

```bash
ssh-keygen -t rsa -b 4096 -C "deploy@siamsoft.net" -f ~/.ssh/yachay_deploy
```

Esto generará dos archivos:

- `~/.ssh/yachay_deploy` (clave privada) ⚠️ NO compartir
- `~/.ssh/yachay_deploy.pub` (clave pública) ✅ Se sube al servidor

### 2️⃣ Agregar la Clave Pública al Servidor Yachay

Copia la clave pública al servidor:

```bash
ssh-copy-id -i ~/.ssh/yachay_deploy.pub d9d1o9e9@yl-kuelap.yachay.pe
```

O manualmente:

1. Conéctate al servidor: `ssh d9d1o9e9@yl-kuelap.yachay.pe`
2. Edita/crea el archivo: `nano ~/.ssh/authorized_keys`
3. Pega el contenido de `~/.ssh/yachay_deploy.pub`
4. Guarda y establece permisos: `chmod 600 ~/.ssh/authorized_keys`

### 3️⃣ Configurar GitHub Secrets

Ve a tu repositorio en GitHub:

- **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Agrega los siguientes secrets:

| Secret Name         | Valor                                           | Descripción                                    |
| ------------------- | ----------------------------------------------- | ---------------------------------------------- |
| `SSH_PRIVATE_KEY`   | Contenido de `~/.ssh/yachay_deploy`             | Clave privada SSH (todo el contenido)          |
| `REMOTE_HOST`       | `yl-kuelap.yachay.pe`                           | Servidor Yachay                                |
| `REMOTE_USER`       | `d9d1o9e9`                                      | Usuario del hosting                            |
| `REMOTE_TARGET`     | `/home/d9d1o9e9/public_html`                    | Ruta de despliegue (ajústala según tu hosting) |
| `VITE_API_BASE_URL` | `http://api.notaria.gobiernodigitalperu.com`    | URL de tu API                                  |
| `VITE_API_QR`       | `https://apis.siamsoft.gobiernodigitalperu.com` | URL de la API de QR                            |

**⚠️ IMPORTANTE:** Para obtener el contenido de `SSH_PRIVATE_KEY`:

```bash
# En Windows (Git Bash o PowerShell)
cat ~/.ssh/yachay_deploy

# En Linux/Mac
cat ~/.ssh/yachay_deploy
```

Copia **TODO** el contenido (desde `-----BEGIN OPENSSH PRIVATE KEY-----` hasta `-----END OPENSSH PRIVATE KEY-----`).

---

## 🔄 Flujo de Trabajo CI/CD

Una vez configurado, el despliegue es automático:

1. **Haces cambios** en tu código local
2. **Commit** y **push** a GitHub:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin main
   ```
3. **GitHub Actions** se ejecuta automáticamente:
   - ✅ Instala dependencias
   - ✅ Construye el proyecto (`npm run build`)
   - ✅ Sube los archivos al servidor Yachay
4. **Tu sitio se actualiza** en: https://siamsoftnotarios.com

---

## 🛠️ Despliegue Manual (Alternativa)

Si prefieres desplegar manualmente:

### Opción A: Script Automático

```bash
# En Linux/Mac/Git Bash
chmod +x deploy.sh
./deploy.sh
```

### Opción B: Comandos Manuales

```bash
# 1. Construir el proyecto
npm run build

# 2. Subir al servidor
rsync -avz --delete dist/ d9d1o9e9@yl-kuelap.yachay.pe:/home/d9d1o9e9/public_html/
```

---

## 📂 Estructura de Archivos Importantes

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de GitHub Actions
├── .env.development            # Variables para desarrollo
├── .env.production             # Variables para producción
├── .env.example                # Plantilla de ejemplo
├── deploy.sh                   # Script de despliegue manual
└── src/
    └── config.js               # Configuración centralizada
```

---

## 🔍 Verificar Despliegue

### Ver logs de GitHub Actions:

1. Ve a tu repositorio en GitHub
2. Click en **Actions**
3. Selecciona el workflow más reciente
4. Revisa los logs de cada paso

### Probar el sitio:

- **Producción:** https://siamsoftnotarios.com
- **API:** http://api.notaria.gobiernodigitalperu.com

---

## 🐛 Solución de Problemas

### ❌ Error: "Permission denied (publickey)"

**Solución:** La clave SSH no está configurada correctamente.

```bash
# Verifica que la clave pública esté en el servidor
ssh d9d1o9e9@yl-kuelap.yachay.pe "cat ~/.ssh/authorized_keys"
```

### ❌ Error: "Target directory does not exist"

**Solución:** Verifica la ruta en GitHub Secrets (`REMOTE_TARGET`).

```bash
# Conéctate al servidor y verifica la ruta
ssh d9d1o9e9@yl-kuelap.yachay.pe
pwd  # Muestra la ruta actual
ls -la  # Lista directorios
```

### ❌ Build falla en GitHub Actions

**Solución:** Revisa que las variables de entorno estén bien configuradas en GitHub Secrets.

### ❌ Sitio muestra contenido antiguo

**Solución:** Limpia la caché del navegador o prueba en modo incógnito.

---

## 📝 Variables de Entorno

### Desarrollo (`npm run dev`):

Lee de `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_API_QR=https://apis.siamsoft.gobiernodigitalperu.com
```

### Producción (`npm run build`):

Lee de `.env.production` + GitHub Secrets:

```env
VITE_API_BASE_URL=http://api.notaria.gobiernodigitalperu.com
VITE_API_QR=https://apis.siamsoft.gobiernodigitalperu.com
```

---

## 🎯 Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Despliegue manual
./deploy.sh

# Conectarse al servidor
ssh d9d1o9e9@yl-kuelap.yachay.pe
```

---

## ⚠️ Notas Importantes

1. **Nunca subas** archivos `.env` a Git (ya están en `.gitignore`)
2. La ruta `REMOTE_TARGET` puede variar según tu plan de hosting Yachay:
   - cPanel: `/home/usuario/public_html`
   - Plesk: `/var/www/vhosts/dominio.com/httpdocs`
   - Otro: Consulta con soporte de Yachay
3. El certificado SSL expira el **19/02/2026** - renovar antes
4. Verifica que la rama sea `main` en el workflow (o cámbiala a `master` si es necesario)

---

## 📞 Soporte

- **Hosting:** Yachay (https://yachay.pe)
- **Servidor:** yl-kuelap.yachay.pe
- **SSL:** R12 (válido hasta 19/02/2026)
- **Dominio:** siamsoftnotarios.com (también disponible: siamsoft.net)

---

## ✅ Checklist Final

- [ ] Llave SSH generada y agregada al servidor
- [ ] GitHub Secrets configurados (6 secrets en total)
- [ ] Archivo `.env.production` con las URLs correctas
- [ ] Ruta `REMOTE_TARGET` verificada en el servidor
- [ ] Primer despliegue exitoso
- [ ] Sitio accesible en https://siamsoftnotarios.com
