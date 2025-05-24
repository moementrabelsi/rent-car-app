$root = ".\src\app"
$filesList = Get-ChildItem -Path $root -Recurse -Filter "*.ts" | Where-Object { 
    $_.FullName -notlike "*api-urls.ts" -and 
    $_.FullName -notlike "*environment.ts" -and
    $_.FullName -notlike "*environment.prod.ts" 
}

foreach ($file in $filesList) {
    $content = Get-Content -Path $file.FullName -Raw
    $original = $content
    $fileName = $file.Name
    
    Write-Host "Processing $fileName..."
    
    # Use a cleaner approach - split by lines, process, then rejoin
    $lines = $content -split "`r`n|`n"
    $newLines = @()
    $importLines = @()
    $seenImports = @{}
    $needApiUrls = $false
    
    # First pass - collect unique imports and check if we need apiUrls
    foreach ($line in $lines) {
        if ($line -match '^import \{.*\} from') {
            $importName = $line.Trim()
            if (-not $seenImports.ContainsKey($importName)) {
                $seenImports[$importName] = $true
                $importLines += $line
            }
        }
        
        if ($line -match 'localhost:5000' -or $line -match 'envService') {
            $needApiUrls = $true
        }
    }
    
    # Add apiUrls import if needed
    if ($needApiUrls -and -not ($importLines -join "`n" -match 'apiUrls')) {
        $importLines += "import { apiUrls } from '../../../utils/api-urls'"
    }
    
    # Remove all EnvironmentService imports
    $importLines = $importLines | Where-Object { $_ -notmatch 'EnvironmentService' }
    
    # Second pass - process the file content
    $inImportSection = $true
    foreach ($line in $lines) {
        # Skip all import lines - we'll add the deduplicated ones later
        if ($line -match '^import \{.*\} from') {
            continue
        }
        
        # We've passed the import section
        if ($inImportSection -and $line -notmatch '^import' -and $line.Trim() -ne '') {
            # Add all unique imports
            $newLines += $importLines
            $newLines += ""  # Add a blank line
            $inImportSection = $false
        }
        
        # Replace EnvironmentService references
        $line = $line -replace ', private envService: EnvironmentService', ''
        $line = $line -replace 'this\.envService\.getFallbackImageUrl\(\)', 'apiUrls.fallbackImageUrl'
        $line = $line -replace 'this\.envService\.getUploadsUrl\((.*?)\)', 'apiUrls.getUploadUrl($1)'
        $line = $line -replace 'this\.envService\.getBaseUrl\(\)', 'apiUrls.baseUrl'
        $line = $line -replace 'this\.envService\.getApiUrl\(\)', 'apiUrls.apiUrl'
        
        # Replace hardcoded URLs
        $line = $line -replace "'http://localhost:5000/uploads/1747396263436_2855267\.jpg'", 'apiUrls.fallbackImageUrl'
        $line = $line -replace '"http://localhost:5000/uploads/1747396263436_2855267\.jpg"', 'apiUrls.fallbackImageUrl'
        
        if (-not $inImportSection) {
            $newLines += $line
        }
    }
    
    # Write the updated content back to the file
    $newContent = $newLines -join "`r`n"
    if ($newContent -ne $original) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated $fileName"
    }
}

Write-Host "All files updated successfully!"
