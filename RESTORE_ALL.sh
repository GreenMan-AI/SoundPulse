#!/bin/bash
# ════════════════════════════════════════════════════════════════
#  SoundForge + Server — PILNA ATJAUNOŠANA
#  Izmantošana: bash RESTORE_ALL.sh
#  Palaid no JEBKURAS vietas — tas pats atrasts visu!
# ════════════════════════════════════════════════════════════════

G='\033[0;32m' R='\033[0;31m' Y='\033[1;33m' C='\033[0;36m' N='\033[0m'
APP="$HOME/Desktop/visi projekti/SoundForge"
SRV="$HOME/Desktop/visi projekti/greenman-ai"
REPO_APP="https://github.com/GreenMan-AI/greenman-ai.git"
REPO_SRV="https://github.com/GreenMan-AI/greenman-ai.git"

echo ""
echo -e "${C}╔══════════════════════════════════════════════════╗${N}"
echo -e "${C}║     SoundForge — Pilna Atjaunošana v3.0         ║${N}"
echo -e "${C}╚══════════════════════════════════════════════════╝${N}"
echo ""

# ── Pārbauda vai git ir instalēts ──────────────────────
if ! command -v git &>/dev/null; then
  echo -e "${R}❌ Git nav instalēts!${N}"
  exit 1
fi

echo -e "${C}Ko vēlies atjaunot?${N}"
echo "  [1] Tikai SERVER (greenman-ai)"
echo "  [2] Tikai APLIKĀCIJA (SoundForge)"
echo "  [3] ABUS (pilna atjaunošana)"
echo ""
read -p "Izvēle (1/2/3): " CHOICE

restore_server() {
  echo ""
  echo -e "${C}═══ SERVERIS ═══${N}"

  # Izveido mapi ja nav
  mkdir -p "$SRV"
  cd "$SRV"

  # Git init ja vajadzīgs
  if [ ! -d ".git" ]; then
    echo -e "${Y}→ Git init...${N}"
    git init
    git remote add origin "$REPO_SRV" 2>/dev/null || git remote set-url origin "$REPO_SRV"
  fi

  # Dabū jaunāko kodu
  echo -e "${Y}→ Lejupielādē jaunāko kodu...${N}"
  git fetch origin 2>/dev/null || true
  git rebase --abort 2>/dev/null || true
  git checkout main 2>/dev/null || git checkout -b main

  # Pievieno failus un push
  echo -e "${Y}→ Commit un push...${N}"
  git add -A
  git commit -m "SoundForge v3.0 restore $(date +%Y-%m-%d)" --allow-empty
  git push -f origin main

  if [ $? -eq 0 ]; then
    echo -e "${G}✅ Serveris augšupielādēts!${N}"
    echo -e "${G}   → Render.com atjauninās automātiski (~2 min)${N}"
  else
    echo -e "${R}❌ Push neizdevās! Mēģini: git push -f origin main${N}"
  fi
}

restore_app() {
  echo ""
  echo -e "${C}═══ APLIKĀCIJA ═══${N}"

  # Izveido mapi ja nav
  mkdir -p "$APP"
  mkdir -p "$APP/components"
  mkdir -p "$APP/app/(tabs)"
  mkdir -p "$APP/assets/images"
  cd "$APP"

  # package.json ja nav
  if [ ! -f "package.json" ]; then
    echo -e "${Y}→ Izveido package.json...${N}"
    cat > package.json << 'PKGJSON'
{
  "name": "soundforge",
  "main": "expo-router/entry",
  "version": "1.1.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/native": "^7.1.8",
    "expo": "~54.0.33",
    "expo-asset": "~12.0.12",
    "expo-audio": "~1.1.1",
    "expo-av": "~16.0.8",
    "expo-constants": "~18.0.13",
    "expo-document-picker": "~14.0.8",
    "expo-file-system": "~19.0.21",
    "expo-font": "~14.0.11",
    "expo-image-picker": "~17.0.10",
    "expo-linking": "~8.0.11",
    "expo-router": "~6.0.23",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-web": "~0.21.0"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  },
  "private": true
}
PKGJSON
  fi

  # tsconfig.json
  if [ ! -f "tsconfig.json" ]; then
    cat > tsconfig.json << 'TSCJSON'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
TSCJSON
  fi

  # expo-env.d.ts
  echo '/// <reference types="expo/types" />' > expo-env.d.ts

  # babel.config.js
  if [ ! -f "babel.config.js" ]; then
    echo 'module.exports = function(api) { api.cache(true); return { presets: ["babel-preset-expo"] }; };' > babel.config.js
  fi

  # .gitignore
  cat > .gitignore << 'GITIGN'
node_modules/
.expo/
dist/
web-build/
*.jks
*.p8
*.p12
*.key
.env
.env.local
GITIGN

  # Placeholder ikona (vajag nomainīt ar īstu)
  for img in icon.png splash-icon.png favicon.png android-icon-foreground.png android-icon-background.png android-icon-monochrome.png; do
    if [ ! -f "assets/images/$img" ]; then
      echo "placeholder" > "assets/images/$img"
    fi
  done

  # Pārbauda vai galvenie faili eksistē
  MISSING=()
  [ ! -f "AppContext.tsx" ]           && MISSING+=("AppContext.tsx")
  [ ! -f "i18n.ts" ]                  && MISSING+=("i18n.ts")
  [ ! -f "app.json" ]                 && MISSING+=("app.json")
  [ ! -f "app/_layout.tsx" ]          && MISSING+=("app/_layout.tsx")
  [ ! -f "components/MainApp.tsx" ]   && MISSING+=("components/MainApp.tsx")
  [ ! -f "components/AuthScreen.tsx" ] && MISSING+=("components/AuthScreen.tsx")
  [ ! -f "components/LangScreen.tsx" ] && MISSING+=("components/LangScreen.tsx")

  if [ ${#MISSING[@]} -gt 0 ]; then
    echo -e "${Y}⚠️  Trūkst faili:${N}"
    for f in "${MISSING[@]}"; do
      echo -e "  ${R}❌ $f${N}"
    done
    echo ""
    echo -e "${Y}Nokopē trūkstošos failus un palaid atkārtoti!${N}"
  fi

  # Git push
  if [ ! -d ".git" ]; then
    git init
    git remote add origin "$REPO_APP" 2>/dev/null || true
  fi

  git fetch origin 2>/dev/null || true
  git rebase --abort 2>/dev/null || true
  git add -A
  git commit -m "SoundForge App v3.0 restore $(date +%Y-%m-%d)" --allow-empty
  git push -f origin main

  if [ $? -eq 0 ]; then
    echo -e "${G}✅ Aplikācija augšupielādēta!${N}"
  fi
}

install_deps() {
  echo ""
  echo -e "${C}═══ NPM INSTALL ═══${N}"
  cd "$APP"
  if command -v npm &>/dev/null; then
    npm install
    echo -e "${G}✅ Pakotnes instalētas!${N}"
  else
    echo -e "${R}❌ npm nav atrasts!${N}"
  fi
}

# ── Izpilda izvēlēto darbību ──────────────────────────
case $CHOICE in
  1) restore_server ;;
  2) restore_app; read -p "Instalēt npm pakotnes? (j/n): " R2; [ "$R2" = "j" ] && install_deps ;;
  3)
    restore_server
    restore_app
    read -p "Instalēt npm pakotnes? (j/n): " R3
    [ "$R3" = "j" ] && install_deps
    ;;
  *) echo -e "${R}Nepareiza izvēle!${N}"; exit 1 ;;
esac

echo ""
echo -e "${C}╔══════════════════════════════════════════════════╗${N}"
echo -e "${C}║                KOPSAVILKUMS                      ║${N}"
echo -e "${C}╚══════════════════════════════════════════════════╝${N}"
echo ""
echo -e "${G}🌐 Web lapa:${N}   https://greenman-ai.onrender.com"
echo -e "${G}📦 GitHub:${N}     https://github.com/GreenMan-AI/greenman-ai"
echo -e "${G}📱 Expo:${N}       https://expo.dev/accounts/greenman/projects/SoundForge"
echo ""
echo -e "${Y}Nākamie soļi:${N}"
echo -e "  ${C}Expo starts:${N}  cd \"$APP\" && npx expo start --clear"
echo -e "  ${C}Jauns APK:${N}    cd \"$APP\" && eas build --platform android --profile preview"
echo ""
