# Inicia o Docker Desktop removendo antes os sockets Unix que ficaram presos.
#
# Por que existe: nesta máquina o Windows não consegue apagar arquivos de socket AF_UNIX
# (erro 1920, "Não é possível o acesso ao arquivo pelo sistema"), provavelmente pelo filtro
# do antivírus McAfee. Quando o Docker fecha, os sockets ficam para trás e, na abertura
# seguinte, ele falha com "initializing Inference manager" ou "initializing Secrets Engine"
# e só oferece "Fechar" ou "Resetar para padrões de fábrica" (NÃO é preciso resetar).
# A distro docker-desktop do WSL consegue apagar esses arquivos, então a limpeza é feita por ela.
#
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\iniciar-docker.ps1

# "Continue": no PowerShell 5.1 o aviso que o docker escreve no stderr não pode interromper o script.
$ErrorActionPreference = "Continue"
function Test-Docker { $null = cmd /c "docker info >nul 2>&1"; return $LASTEXITCODE -eq 0 }
$local = $env:LOCALAPPDATA

if (Test-Docker) { Write-Host "Docker já está rodando."; exit 0 }

if (Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue) {
    Write-Host "Fechando o Docker Desktop que ficou travado..."
    Get-Process | Where-Object { $_.ProcessName -match "docker" } | Stop-Process -Force
    Start-Sleep -Seconds 3
}

# Caminho do perfil no formato do WSL (C:\Users\x\AppData\Local -> /tmp/c/Users/x/AppData/Local)
$wslLocal = "/tmp/c" + ($local.Substring(2) -replace "\\", "/")
$alvos = @("Docker/run/*", "docker-secrets-engine/*.sock") | ForEach-Object { "$wslLocal/$_" }  # sem aspas: o * precisa ser expandido pelo sh
$cmd = "mkdir -p /tmp/c && (mountpoint -q /tmp/c || mount -t drvfs C: /tmp/c) && for f in $($alvos -join ' '); do [ -e `"`$f`" ] && rm -f `"`$f`" && echo removido: `$f; done; true"

Write-Host "Removendo sockets presos..."
wsl -d docker-desktop -u root -e sh -c $cmd 2>&1 | Where-Object { $_ -match "removido" }
wsl --shutdown

Write-Host "Iniciando o Docker Desktop..."
Start-Process "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 3
    if (Test-Docker) { Write-Host "Docker pronto: $(docker version --format '{{.Server.Version}}')"; exit 0 }
}
Write-Host "O Docker não respondeu em 3 minutos. Veja $local\Docker\log\host\com.docker.backend.exe.log"
exit 1
