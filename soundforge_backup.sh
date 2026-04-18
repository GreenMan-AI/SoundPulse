#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  SoundForge — AUTO BACKUP SKRIPTS
#  Saglabā VISUS svarīgos failus uz: ~/Desktop/visi projekti/Beckup
#  Izmantošana: bash soundforge_backup.sh
# ═══════════════════════════════════════════════════════════════

# ── KRĀSAS ────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "  ${RED}❌ $1${NC}"; }
info() { echo -e "  ${CYAN}ℹ️  $1${NC}"; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        SoundForge — Backup Sistēma v2.0          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── CEĻI ─────────────────────────────────────────────────────
BASE="$HOME/Desktop/visi projekti"
APP_DIR="$BASE/SoundForge"
SERVER_DIR="$BASE/greenman-ai"   # vai kur ir server.js
BACKUP_DIR="$BASE/Beckup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="soundforge_backup_${TIMESTAMP}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
MAX_BACKUPS=10   # max cik backup saglabāt

# ── PĀRBAUDE: vai projekta mape eksistē ──────────────────────
if [ ! -d "$APP_DIR" ]; then
  # Mēģina atrast projektu
  FOUND=$(find "$BASE" -maxdepth 3 -name "AppContext.tsx" 2>/dev/null | head -1)
  if [ -n "$FOUND" ]; then
    APP_DIR=$(dirname "$FOUND")
    info "Projekts atrasts: $APP_DIR"
  else
    err "Projekts nav atrasts zem: $BASE"
    echo -e "  ${YELLOW}Pārliecinies ka mape ir: $APP_DIR${NC}"
    echo -n "  Ievadi pareizo ceļu uz projektu (vai Enter lai izlaistu): "
    read CUSTOM_PATH
    if [ -n "$CUSTOM_PATH" ] && [ -d "$CUSTOM_PATH" ]; then
      APP_DIR="$CUSTOM_PATH"
    else
      err "Projekts nav atrasts. Atceļu."
      exit 1
    fi
  fi
fi

# ── PĀRBAUDE: vai server.js ir ──────────────────────────────
if [ ! -f "$SERVER_DIR/server.js" ]; then
  # Meklē server.js
  SRV=$(find "$BASE" -maxdepth 4 -name "server.js" 2>/dev/null | head -1)
  if [ -n "$SRV" ]; then
    SERVER_DIR=$(dirname "$SRV")
    info "server.js atrasts: $SERVER_DIR"
  else
    warn "server.js nav atrasts — serveris netiks saglabāts"
    SERVER_DIR=""
  fi
fi

# ── IZVEIDOT BACKUP MAPI ──────────────────────────────────────
mkdir -p "$BACKUP_PATH"
if [ ! -d "$BACKUP_PATH" ]; then
  err "Nevarēja izveidot backup mapi: $BACKUP_PATH"
  exit 1
fi

echo -e "${BOLD}Projekts:${NC} $APP_DIR"
echo -e "${BOLD}Serveris:${NC} ${SERVER_DIR:-nav atrasts}"
echo -e "${BOLD}Backup:${NC}   $BACKUP_PATH"
echo ""

SAVED=0
MISSED=0

# ── KOPĒŠANAS FUNKCIJA ────────────────────────────────────────
backup_file() {
  local src="$1"
  local rel="$2"   # relatīvs ceļš zip iekšienē
  local dst_dir="$BACKUP_PATH/$(dirname $rel)"
  
  mkdir -p "$dst_dir"
  
  if [ -f "$src" ]; then
    cp "$src" "$dst_dir/$(basename $rel)"
    ok "$(basename $rel)  ($(du -h "$src" | cut -f1))"
    SAVED=$((SAVED + 1))
  else
    warn "Nav: $rel"
    MISSED=$((MISSED + 1))
  fi
}

backup_dir() {
  local src_dir="$1"
  local dst_name="$2"
  if [ -d "$src_dir" ]; then
    cp -r "$src_dir" "$BACKUP_PATH/$dst_name"
    ok "Mape: $dst_name/  ($(du -sh "$src_dir" | cut -f1))"
    SAVED=$((SAVED + 1))
  else
    warn "Nav mapes: $dst_name"
    MISSED=$((MISSED + 1))
  fi
}

# ════════════════════════════════════════════════════
#  1. EXPO / REACT NATIVE APLIKĀCIJA
# ════════════════════════════════════════════════════
echo -e "${CYAN}── 1. Aplikācija (Expo/React Native) ────────────────${NC}"

backup_file "$APP_DIR/AppContext.tsx"              "AppContext.tsx"
backup_file "$APP_DIR/i18n.ts"                     "i18n.ts"
backup_file "$APP_DIR/app/_layout.tsx"             "app_layout.tsx"
backup_file "$APP_DIR/app.json"                    "app.json"
backup_file "$APP_DIR/package.json"                "package.json"
backup_file "$APP_DIR/tsconfig.json"               "tsconfig.json"
backup_file "$APP_DIR/metro.config.js"             "metro.config.js"
backup_file "$APP_DIR/babel.config.js"             "babel.config.js"
backup_file "$APP_DIR/.env"                        ".env"
backup_file "$APP_DIR/.env.local"                  ".env.local"

# ════════════════════════════════════════════════════
#  2. KOMPONENTI (galvenais kods!)
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── 2. Komponenti ─────────────────────────────────────${NC}"

backup_file "$APP_DIR/components/MainApp.tsx"      "components/MainApp.tsx"
backup_file "$APP_DIR/components/LangScreen.tsx"   "components/LangScreen.tsx"
backup_file "$APP_DIR/components/AuthScreen.tsx"   "components/AuthScreen.tsx"
backup_file "$APP_DIR/components/HomeScreen.tsx"   "components/HomeScreen.tsx"
backup_file "$APP_DIR/components/ProfileScreen.tsx" "components/ProfileScreen.tsx"
backup_file "$APP_DIR/components/ChatScreen.tsx"   "components/ChatScreen.tsx"
backup_file "$APP_DIR/components/MusicScreen.tsx"  "components/MusicScreen.tsx"
backup_file "$APP_DIR/components/InfoScreen.tsx"   "components/InfoScreen.tsx"
backup_file "$APP_DIR/components/PlayerBar.tsx"    "components/PlayerBar.tsx"
backup_file "$APP_DIR/components/UploadScreen.tsx" "components/UploadScreen.tsx"
backup_file "$APP_DIR/components/SettingsScreen.tsx" "components/SettingsScreen.tsx"

# ════════════════════════════════════════════════════
#  3. APP TABS / NAVIGĀCIJA
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── 3. App Tabs / Navigācija ──────────────────────────${NC}"

backup_file "$APP_DIR/app/(tabs)/index.tsx"        "app/tabs/index.tsx"
backup_file "$APP_DIR/app/(tabs)/admin.tsx"        "app/tabs/admin.tsx"
backup_file "$APP_DIR/app/(tabs)/explore.tsx"      "app/tabs/explore.tsx"
backup_file "$APP_DIR/app/(tabs)/_layout.tsx"      "app/tabs/_layout.tsx"

# Visa app/ mape (ja eksistē)
if [ -d "$APP_DIR/app" ]; then
  cp -r "$APP_DIR/app" "$BACKUP_PATH/app_full/"
  ok "app/ mape (pilna kopija)"
fi

# ════════════════════════════════════════════════════
#  4. SERVERIS (server.js + konfigurācija)
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── 4. Serveris ───────────────────────────────────────${NC}"

if [ -n "$SERVER_DIR" ]; then
  backup_file "$SERVER_DIR/server.js"            "server/server.js"
  backup_file "$SERVER_DIR/package.json"         "server/package.json"
  backup_file "$SERVER_DIR/package-lock.json"    "server/package-lock.json"
  backup_file "$SERVER_DIR/.env"                 "server/.env"
  backup_file "$SERVER_DIR/.env.example"         "server/.env.example"
  backup_file "$SERVER_DIR/index.html"           "server/index.html"
  backup_file "$SERVER_DIR/design.css"           "server/design.css"
  # Profilē atsevišķas mapes
  backup_dir  "$SERVER_DIR/public"               "server/public"
  backup_dir  "$SERVER_DIR/routes"               "server/routes"
  backup_dir  "$SERVER_DIR/middleware"           "server/middleware"
fi

# ════════════════════════════════════════════════════
#  5. ASSETS (ikonas, attēli)
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── 5. Assets ─────────────────────────────────────────${NC}"

if [ -d "$APP_DIR/assets" ]; then
  cp -r "$APP_DIR/assets" "$BACKUP_PATH/assets/"
  ok "assets/ mape  ($(du -sh "$APP_DIR/assets" | cut -f1))"
  SAVED=$((SAVED + 1))
else
  warn "assets/ nav"
  MISSED=$((MISSED + 1))
fi

# ════════════════════════════════════════════════════
#  6. SCRIPTS / BASH
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── 6. Skripti ────────────────────────────────────────${NC}"

# Saglabā šo pašu backup skriptu
cp "$0" "$BACKUP_PATH/soundforge_backup.sh" 2>/dev/null && ok "soundforge_backup.sh"
backup_file "$BASE/soundforge_check.sh"    "soundforge_check.sh"
backup_file "$BASE/git_fix.sh"             "git_fix.sh"

# ════════════════════════════════════════════════════
#  7. METADATA — backup info fails
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── 7. Metadata ───────────────────────────────────────${NC}"

META_FILE="$BACKUP_PATH/BACKUP_INFO.txt"
cat > "$META_FILE" << METAEOF
═══════════════════════════════════════════════
 SoundForge — Backup Informācija
═══════════════════════════════════════════════
 Datums:     $(date '+%Y-%m-%d %H:%M:%S')
 Backup:     $BACKUP_NAME
 Projekts:   $APP_DIR
 Serveris:   ${SERVER_DIR:-nav}
 Faili OK:   $SAVED
 Izlaisti:   $MISSED
 Git commit: $(cd "$APP_DIR" 2>/dev/null && git log --oneline -1 2>/dev/null || echo "nav git")
 Git branch: $(cd "$APP_DIR" 2>/dev/null && git branch --show-current 2>/dev/null || echo "nav")
 Node ver:   $(node --version 2>/dev/null || echo "nav")
 npm ver:    $(npm --version 2>/dev/null || echo "nav")
═══════════════════════════════════════════════
METAEOF
ok "BACKUP_INFO.txt izveidots"

# ════════════════════════════════════════════════════
#  8. ZIPOŠANA
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── 8. Zipošana ───────────────────────────────────────${NC}"

ZIP_FILE="$BACKUP_DIR/${BACKUP_NAME}.zip"
cd "$BACKUP_DIR"

if command -v zip &>/dev/null; then
  zip -r "${BACKUP_NAME}.zip" "$BACKUP_NAME/" -x "*.DS_Store" -x "*__MACOSX*" > /dev/null 2>&1
  if [ -f "$ZIP_FILE" ]; then
    ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
    ok "ZIP izveidots: ${BACKUP_NAME}.zip  ($ZIP_SIZE)"
    rm -rf "$BACKUP_PATH"
    ok "Pagaidu mape notīrīta"
  else
    warn "ZIP neizdevās — mape saglabāta kā $BACKUP_NAME/"
  fi
else
  warn "zip nav instalēts — mape saglabāta kā $BACKUP_NAME/ (nav zipota)"
fi

# ════════════════════════════════════════════════════
#  9. VECO BACKUPU TĪRĪŠANA (saglabā MAX_BACKUPS jaunākos)
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── 9. Veco backupu tīrīšana ──────────────────────────${NC}"

OLD_BACKUPS=($(ls -t "$BACKUP_DIR"/soundforge_backup_*.zip 2>/dev/null))
COUNT=${#OLD_BACKUPS[@]}

if [ $COUNT -gt $MAX_BACKUPS ]; then
  TO_DELETE=$((COUNT - MAX_BACKUPS))
  info "Kopā backupi: $COUNT — dzēšu $TO_DELETE vecos"
  for i in "${OLD_BACKUPS[@]:$MAX_BACKUPS}"; do
    rm -f "$i"
    warn "Dzēsts: $(basename $i)"
  done
else
  info "Backup skaits: $COUNT / $MAX_BACKUPS — tīrīšana nav vajadzīga"
fi

# ════════════════════════════════════════════════════
#  REZULTĀTS
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║               BACKUP PABEIGTS!                   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✅ Saglabāti faili:${NC}  $SAVED"
echo -e "  ${YELLOW}⚠️  Izlaisti:${NC}        $MISSED  (nav šajā projektā)"
echo -e "  ${CYAN}📁 Atrašanās vieta:${NC} $BACKUP_DIR"
echo ""

if [ -f "$ZIP_FILE" ]; then
  echo -e "  ${GREEN}📦 Fails: ${BACKUP_NAME}.zip${NC}"
fi

echo ""
echo -e "${YELLOW}Lai atjaunotu, izmanto:${NC}"
echo -e "  bash soundforge_restore.sh"
echo ""
