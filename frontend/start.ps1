#!/usr/bin/env pwsh
# Error Handling Pattern implementation for Environment Startup
# Implements: Fail Fast, Graceful Degradation, Result Types, Meaningful Messages

$ErrorActionPreference = "Stop"

# 1. Custom Exception Hierarchy (Pattern: Domain-Specific Errors)
class ApplicationError : System.Exception {
    [string]$Code
    [hashtable]$Details
    ApplicationError([string]$Message, [string]$Code, [hashtable]$Details) : base($Message) {
        $this.Code = $Code
        $this.Details = $Details
    }
}

class EnvironmentError : ApplicationError {
    EnvironmentError([string]$Message, [hashtable]$Details) : base($Message, "ENV_ERROR", $Details) {}
}

# 2. Result Type Pattern for Safe Execution
function Get-CommandSafe {
    param([string]$Cmd)
    try {
        $found = Get-Command $Cmd -ErrorAction Stop
        return @{ Ok = $true; Value = $found }
    } catch {
        return @{ Ok = $false; Error = "Command not found" }
    }
}

# 3. Graceful Degradation Pattern (Fallback logic)
function Resolve-NodeEnvironment {
    Write-Host "Attempting graceful recovery of Node environment..." -ForegroundColor Yellow

    # Try fnm (Fast Node Manager)
    $fnmCheck = Get-CommandSafe "fnm"
    if ($fnmCheck.Ok) {
        Write-Host "Found fnm, attempting to load Node environment" -ForegroundColor Cyan
        try {
            fnm env | Out-String | Invoke-Expression
            # Install required version if local config expects it
            fnm install 20 --quiet | Out-Null
            fnm use 20 --quiet | Out-Null
            return $true
        } catch {
            return $false
        }
    }

    # Try nvm (Node Version Manager for Windows)
    $nvmCheck = Get-CommandSafe "nvm"
    if ($nvmCheck.Ok) {
        Write-Host "Found nvm, attempting to load Node environment" -ForegroundColor Cyan
        try {
            nvm use 20
            return $true
        } catch {
            return $false
        }
    }

    return $false
}

# 4. Fail Fast Validation
function Validate-Environment {
    $nodeCheck = Get-CommandSafe "node"

    if (-not $nodeCheck.Ok) {
        # Attempt fallback
        $recovered = Resolve-NodeEnvironment
        if (-not $recovered -or -not (Get-CommandSafe "node").Ok) {
            throw [EnvironmentError]::new(
                "Node.js is not recognized. It is either not installed or not in your PATH.",
                @{ Suggestion = "Install Node.js >= 20.18.0 or activate your node version manager (fnm/nvm) in this terminal." }
            )
        }
        Write-Host "✅ Environment recovered gracefully." -ForegroundColor Green
    }

    # Version validation
    try {
        $rawVersion = (node -v).Trim().TrimStart('v')
        $version = [version]$rawVersion
        # Re-check after potential fallback
        if ($version -lt [version]"20.18.0") {
            $recovered = Resolve-NodeEnvironment
            $newRawVersion = (node -v | Select-Object -First 1).Trim().TrimStart('v')
            $newVersion = [version]$newRawVersion

            if ($newVersion -lt [version]"20.18.0") {
                throw [EnvironmentError]::new(
                    "Incompatible Node version.",
                    @{ Expected = ">= 20.18.0"; Got = $rawVersion; Action = "Run 'fnm install 20' or 'nvm install 20.18.0' followed by 'use'." }
                )
            }
        }
    } catch [EnvironmentError] {
        throw
    } catch {
        throw [EnvironmentError]::new(
            "Failed to parse Node version or execute node.",
            @{ Error = $_.Message }
        )
    }
}

# Entry Point / Global Catcher
try {
    Write-Host "🔍 Validating environment before startup..." -ForegroundColor Cyan
    Validate-Environment

    Write-Host "✅ Environment is healthy. Starting Expo server..." -ForegroundColor Green
    # Execute the actual start command
    pnpm exec expo start
}
catch [EnvironmentError] {
    # 5. Meaningful Error Messages Pattern
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Code: $($_.Exception.Code)" -ForegroundColor Red
    if ($_.Exception.Details.Keys.Count -gt 0) {
        Write-Host "Details:" -ForegroundColor Yellow
        $_.Exception.Details.GetEnumerator() | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Value)" -ForegroundColor White
        }
    }
    exit 1
}
catch {
    Write-Host "`n❌ Unexpected Critical Error: $_" -ForegroundColor Red
    exit 1
}
