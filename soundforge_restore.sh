#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  SoundForge — ATJAUNOŠANA NO BACKUP
#  Izmantošana: bash soundforge_restore.sh
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
echo -e "${CYAN}║      SoundForge — Atjaunošana no Backup          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── CEĻI ──────────────────────────────────────────────────────
BASE="$HOME/Desktop/visi projekti"
APP_DIR="$BASE/SoundForge"
SERVER_DIR="$BASE/greenman-ai"
BACKUP_DIR="$BASE/Beckup"

# Pārbaude vai backup mape eksistē
if [ ! -d "$BACKUP_DIR" ]; then
  err "Backup mape nav atrasta: $BACKUP_DIR"
  echo -n "  Ievadi ceļu uz backup mapi: "
  read CUSTOM_BD
  if [ -d "$CUSTOM_BD" ]; then
    BACKUP_DIR="$CUSTOM_BD"
  else
    err "Mape nav atrasta. Atceļu."
    exit 1
  fi
fi

# ── PARĀDA PIEEJAMOS BACKUPUS ─────────────────────────────────
echo -e "${CYAN}Pieejamie backupi:${NC}"
echo ""

BACKUPS=($(ls -t "$BACKUP_DIR"/soundforge_backup_*.zip 2>/dev/null))

if [ ${#BACKUPS[@]} -eq 0 ]; then
  err "Nav soundforge backup failu mapē: $BACKUP_DIR"
  info "Vispirms palaid: bash soundforge_backup.sh"
  exit 1
fi

for i in "${!BACKUPS[@]}"; do
  FNAME=$(basename "${BACKUPS[$i]}" .zip)
  SIZE=$(du -h "${BACKUPS[$i]}" | cut -f1)
  DATE_PART=$(echo "$FNAME" | grep -o '[0-9]\{8\}_[0-9]\{6\}')
  NICE_DATE=$(echo "$DATE_PART" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
  echo -e "  ${GREEN}[$((i+1))]${NC} $NICE_DATE  ($SIZE)"
done

echo ""
echo -n "Izvēlies numuru (vai Enter lai atceltu): "
read CHOICE

# Validācija
if [ -z "$CHOICE" ]; then
  info "Atcelts."
  exit 0
fi

if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt "${#BACKUPS[@]}" ]; then
  err "Nepareizs numurs! Ievadi skaitli no 1 līdz ${#BACKUPS[@]}"
  exit 1
fi

SELECTED="${BACKUPS[$((CHOICE-1))]}"
BACKUP_FNAME=$(basename "$SELECTED" .zip)

# ── IZVĒLES APSTIPRINĀJUMS ────────────────────────────────────
echo ""
echo -e "${YELLOW}┌─────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│  ⚠️  UZMANĪBU — Atjauno:                 │${NC}"
echo -e "${YELLOW}│  $BACKUP_FNAME  │${NC}"
echo -e "${YELLOW}│                                         │${NC}"
echo -e "${YELLOW}│  Pašreizējie faili TIKS PĀRRAKSTĪTI!    │${NC}"
echo -e "${YELLOW}└─────────────────────────────────────────┘${NC}"
echo ""
echo -n "  Vai turpināt? (ieraksti 'jā' lai apstiprinātu): "
read CONFIRM

if [ "$CONFIRM" != "jā" ] && [ "$CONFIRM" != "ja" ] && [ "$CONFIRM" != "j" ] && [ "$CONFIRM" != "J" ]; then
  info "Atcelts."
  exit 0
fi

# ── DROŠĪBAS BACKUP PIRMS ATJAUNOŠANAS ───────────────────────
echo ""
echo -e "${CYAN}── Drošības backup pirms atjaunošanas ────────────────${NC}"

SAFETY_TS=$(date +%Y%m%d_%H%M%S)
SAFETY_NAME="soundforge_backup_BEFORE_RESTORE_${SAFETY_TS}"
SAFETY_PATH="$BACKUP_DIR/$SAFETY_NAME"
mkdir -p "$SAFETY_PATH"

# Saglabā pašreizējo stāvokli
SAFETY_FILES=(
  "$APP_DIR/AppContext.tsx"
  "$APP_DIR/i18n.ts"
  "$APP_DIR/app.json"
  "$APP_DIR/package.json"
  "$APP_DIR/components/MainApp.tsx"
  "$APP_DIR/components/LangScreen.tsx"
  "$APP_DIR/components/AuthScreen.tsx"
  "$SERVER_DIR/server.js"
  "$SERVER_DIR/index.html"
)

SAFETY_SAVED=0
for f in "${SAFETY_FILES[@]}"; do
  if [ -f "$f" ]; then
    FNAME=$(basename "$f")
    cp "$f" "$SAFETY_PATH/$FNAME"
    SAFETY_SAVED=$((SAFETY_SAVED + 1))
  fi
done

if [ $SAFETY_SAVED -gt 0 ]; then
  cd "$BACKUP_DIR"
  zip -r "${SAFETY_NAME}.zip" "$SAFETY_NAME/" > /dev/null 2>&1
  rm -rf "$SAFETY_PATH"
  ok "Drošības backup saglabāts: ${SAFETY_NAME}.zip ($SAFETY_SAVED faili)"
fi

# ── IZPAKO IZVĒLĒTO BACKUP ────────────────────────────────────
echo ""
echo -e "${CYAN}── Izpako backup ─────────────────────────────────────${NC}"

TEMP_DIR=$(mktemp -d)
if command -v unzip &>/dev/null; then
  unzip -q "$SELECTED" -d "$TEMP_DIR" 2>/dev/null
elif command -v 7z &>/dev/null; then
  7z x "$SELECTED" -o"$TEMP_DIR" > /dev/null 2>&1
else
  err "Nav unzip vai 7z! Instalē: winget install 7zip"
  exit 1
fi

# Atrod backup saturu
BACKUP_ROOT=""
if [ -d "$TEMP_DIR/$BACKUP_FNAME" ]; then
  BACKUP_ROOT="$TEMP_DIR/$BACKUP_FNAME"
else
  # Meklē rekursīvi
  BACKUP_ROOT=$(find "$TEMP_DIR" -maxdepth 2 -name "AppContext.tsx" -o -name "server.js" 2>/dev/null | head -1 | xargs -I{} dirname {} 2>/dev/null)
  if [ -z "$BACKUP_ROOT" ]; then
    BACKUP_ROOT="$TEMP_DIR"
  fi
fi

ok "Backup izpakots uz: $TEMP_DIR"

RESTORED=0
SKIPPED=0

# ── ATJAUNOŠANAS FUNKCIJA ─────────────────────────────────────
restore_f() {
  local src="$1"    # ceļš backup iekšienē
  local dst="$2"    # mērķa ceļš
  
  local full_src="$BACKUP_ROOT/$src"
  
  # Ja src satur app_layout, saglabā uz _layout
  if [ -f "$full_src" ]; then
    mkdir -p "$(dirname "$dst")"
    cp "$full_src" "$dst"
    ok "$(basename $dst)"
    RESTORED=$((RESTORED + 1))
  else
    warn "Nav backupā: $(basename $src)"
    SKIPPED=$((SKIPPED + 1))
  fi
}

# ════════════════════════════════════════════════════
#  ATJAUNO APLIKĀCIJU
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── Aplikācija ────────────────────────────────────────${NC}"

restore_f "AppContext.tsx"           "$APP_DIR/AppContext.tsx"
restore_f "i18n.ts"                  "$APP_DIR/i18n.ts"
restore_f "app_layout.tsx"          "$APP_DIR/app/_layout.tsx"
restore_f "app.json"                 "$APP_DIR/app.json"
restore_f "package.json"             "$APP_DIR/package.json"
restore_f "tsconfig.json"            "$APP_DIR/tsconfig.json"
restore_f "metro.config.js"          "$APP_DIR/metro.config.js"
restore_f "babel.config.js"          "$APP_DIR/babel.config.js"

# ════════════════════════════════════════════════════
#  ATJAUNO KOMPONENTUS
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── Komponenti ────────────────────────────────────────${NC}"

restore_f "components/MainApp.tsx"       "$APP_DIR/components/MainApp.tsx"
restore_f "components/LangScreen.tsx"    "$APP_DIR/components/LangScreen.tsx"
restore_f "components/AuthScreen.tsx"    "$APP_DIR/components/AuthScreen.tsx"
restore_f "components/HomeScreen.tsx"    "$APP_DIR/components/HomeScreen.tsx"
restore_f "components/ProfileScreen.tsx" "$APP_DIR/components/ProfileScreen.tsx"
restore_f "components/ChatScreen.tsx"    "$APP_DIR/components/ChatScreen.tsx"
restore_f "components/MusicScreen.tsx"   "$APP_DIR/components/MusicScreen.tsx"
restore_f "components/InfoScreen.tsx"    "$APP_DIR/components/InfoScreen.tsx"
restore_f "components/PlayerBar.tsx"     "$APP_DIR/components/PlayerBar.tsx"
restore_f "components/UploadScreen.tsx"  "$APP_DIR/components/UploadScreen.tsx"
restore_f "components/SettingsScreen.tsx" "$APP_DIR/components/SettingsScreen.tsx"

# ════════════════════════════════════════════════════
#  ATJAUNO APP TABS
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── App Tabs ──────────────────────────────────────────${NC}"

restore_f "app/tabs/index.tsx"      "$APP_DIR/app/(tabs)/index.tsx"
restore_f "app/tabs/admin.tsx"      "$APP_DIR/app/(tabs)/admin.tsx"
restore_f "app/tabs/explore.tsx"    "$APP_DIR/app/(tabs)/explore.tsx"
restore_f "app/tabs/_layout.tsx"    "$APP_DIR/app/(tabs)/_layout.tsx"

# Ja ir pilna app/ kopija backupā
if [ -d "$BACKUP_ROOT/app_full" ]; then
  info "Atrasta pilna app/ kopija — izmanto to"
  cp -r "$BACKUP_ROOT/app_full/." "$APP_DIR/app/"
  ok "app/ mape atjaunota (pilna)"
fi

# ════════════════════════════════════════════════════
#  ATJAUNO SERVERI
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── Serveris ──────────────────────────────────────────${NC}"

if [ -d "$BACKUP_ROOT/server" ]; then
  restore_f "server/server.js"       "$SERVER_DIR/server.js"
  restore_f "server/package.json"    "$SERVER_DIR/package.json"
  restore_f "server/index.html"      "$SERVER_DIR/index.html"
  restore_f "server/design.css"      "$SERVER_DIR/design.css"
  restore_f "server/.env.example"    "$SERVER_DIR/.env.example"
  
  if [ -d "$BACKUP_ROOT/server/public" ]; then
    cp -r "$BACKUP_ROOT/server/public/." "$SERVER_DIR/public/"
    ok "server/public/ atjaunots"
  fi
else
  warn "Servera faili nav šajā backupā"
fi

# ════════════════════════════════════════════════════
#  ATJAUNO ASSETS
# ════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}── Assets ────────────────────────────────────────────${NC}"

if [ -d "$BACKUP_ROOT/assets" ]; then
  cp -r "$BACKUP_ROOT/assets/." "$APP_DIR/assets/"
  ok "assets/ atjaunots"
  RESTORED=$((RESTORED + 1))
else
  warn "assets/ nav šajā backupā"
fi

# ── TĪRĀM ─────────────────────────────────────────────────────
rm -rf "$TEMP_DIR"

# ── REZULTĀTS ─────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║            ATJAUNOŠANA PABEIGTA!                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✅ Atjaunoti faili:${NC}  $RESTORED"
echo -e "  ${YELLOW}⚠️  Nav backupā:${NC}     $SKIPPED"
echo ""
echo -e "${YELLOW}Nākamie soļi:${NC}"
echo ""
echo -e "  ${CYAN}1. Restartē Expo:${NC}"
echo -e "     cd \"$APP_DIR\""
echo -e "     npx expo start --clear"
echo ""
echo -e "  ${CYAN}2. Ja vajag pārinstalēt paketes:${NC}"
echo -e "     npm install"
echo ""
echo -e "  ${CYAN}3. Serveris (Render.com):${NC}"
echo -e "     Augšupielādē server.js un package.json uz GitHub"
echo -e "     Render automātiski restartēs"
echo ""
