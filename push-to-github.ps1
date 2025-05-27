# This script will help push the document management system to GitHub
# It uses Git from GitHub Desktop if available

Write-Host "Starting GitHub upload process..." -ForegroundColor Green

# Try to find Git from GitHub Desktop
$gitHubDesktopGit = Get-ChildItem -Path "C:\Users\$env:USERNAME\AppData\Local\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if ($gitHubDesktopGit) {
    $gitExe = $gitHubDesktopGit
    Write-Host "Found Git from GitHub Desktop at: $gitExe" -ForegroundColor Green
}
else {
    # Try other common Git installation paths
    $gitPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe", 
        "C:\Program Files (x86)\Git\bin\git.exe"
    )

    $gitExe = $null
    foreach ($path in $gitPaths) {
        if (Test-Path $path) {
            $gitExe = $path
            Write-Host "Found Git at: $gitExe" -ForegroundColor Green
            break
        }
    }

    if ($null -eq $gitExe) {
        # Try to use Git from PATH as a last resort
        try {
            $gitVersion = cmd /c "git --version"
            $gitExe = "git"
            Write-Host "Using Git from PATH: $gitVersion" -ForegroundColor Green
        }
        catch {
            Write-Host "Git not found. Please install Git and make sure it's in your PATH." -ForegroundColor Red
            Write-Host "You can download Git from https://git-scm.com/download/win" -ForegroundColor Yellow
            exit 1
        }
    }
}

# Function to run Git commands
function Invoke-Git {
    param (
        [string]$Arguments
    )
    
    $fullCommand = if ($gitExe -eq "git") { "git $Arguments" } else { "& `"$gitExe`" $Arguments" }
    Write-Host "> $fullCommand" -ForegroundColor Cyan
    
    try {
        if ($gitExe -eq "git") {
            Invoke-Expression "git $Arguments"
        }
        else {
            Invoke-Expression "& `"$gitExe`" $Arguments"
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Git command failed with exit code $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
        return $true
    }
    catch {
        Write-Host "Error executing Git command: $_" -ForegroundColor Red
        return $false
    }
}

# Configure Git user if not already set
$gitUser = Invoke-Expression "& `"$gitExe`" config --global user.name" -ErrorAction SilentlyContinue
$gitEmail = Invoke-Expression "& `"$gitExe`" config --global user.email" -ErrorAction SilentlyContinue

if (-not $gitUser -or -not $gitEmail) {
    Write-Host "Git user information not configured. Please provide the following:" -ForegroundColor Yellow
    
    if (-not $gitUser) {
        $username = Read-Host "Enter your GitHub username"
        Invoke-Expression "& `"$gitExe`" config --global user.name `"$username`""
    }
    
    if (-not $gitEmail) {
        $email = Read-Host "Enter your GitHub email"
        Invoke-Expression "& `"$gitExe`" config --global user.email `"$email`""
    }
}

Write-Host "Initializing Git repository..." -ForegroundColor Yellow
if (-not (Invoke-Git -Arguments "init")) { exit 1 }

Write-Host "Adding remote repository..." -ForegroundColor Yellow
if (-not (Invoke-Git -Arguments "remote add origin https://github.com/rushikeshghule/document-management.git")) { exit 1 }

Write-Host "Adding files to Git..." -ForegroundColor Yellow
if (-not (Invoke-Git -Arguments "add .")) { exit 1 }

Write-Host "Committing files..." -ForegroundColor Yellow
if (-not (Invoke-Git -Arguments "commit -m `"Initial commit for document management system`"")) { exit 1 }

Write-Host "Setting up main branch..." -ForegroundColor Yellow
if (-not (Invoke-Git -Arguments "branch -M main")) { exit 1 }

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may be prompted for your GitHub credentials" -ForegroundColor Yellow
if (-not (Invoke-Git -Arguments "push -u origin main")) { exit 1 }

Write-Host "Successfully pushed code to GitHub!" -ForegroundColor Green
Write-Host "You can view your repository at: https://github.com/rushikeshghule/document-management" -ForegroundColor Green 