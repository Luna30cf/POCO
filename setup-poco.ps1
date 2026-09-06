[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Préparation de l'environnement POCO ==="

# Vérification de Node.js
Write-Host "`n[1/5] Vérification de Node.js..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js n'est pas installé ou n'est pas accessible dans le PATH."
    exit 1
}

$nodeVersion = node --version
Write-Host "Node.js détecté : $nodeVersion"

# Vérification de npm
Write-Host "`n[2/5] Vérification de npm..."
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm n'est pas installé ou n'est pas accessible dans le PATH."
    exit 1
}

$npmVersion = npm --version
Write-Host "npm détecté : $npmVersion"

# Accès au backend POCO
Write-Host "`n[3/5] Accès au dossier website..."
$websitePath = Join-Path $PSScriptRoot "website"

if (-not (Test-Path $websitePath)) {
    Write-Error "Le dossier website est introuvable."
    exit 1
}

Set-Location $websitePath
Write-Host "Dossier courant : $websitePath"

# Vérification de la configuration
Write-Host "`n[4/5] Vérification de l'environnement..."

if (-not (Test-Path "package.json")) {
    Write-Error "Le fichier package.json est introuvable."
    exit 1
}

if (Test-Path ".env") {
    Write-Host "Fichier .env détecté."
}
else {
    Write-Warning "Fichier .env absent : les variables d'environnement devront être configurées."
}

# Installation reproductible des dépendances
Write-Host "`n[5/5] Installation des dépendances..."

if (Test-Path "package-lock.json") {
    npm ci
}
else {
    npm install
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "L'installation des dépendances a échoué."
    exit 1
}

Write-Host "`n=== Environnement POCO préparé avec succès ==="
Write-Host "Pour lancer le backend : node server.js"