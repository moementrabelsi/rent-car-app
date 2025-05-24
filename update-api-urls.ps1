$root = ".\src"
$filesList = Get-ChildItem -Path $root -Recurse -Filter "*.ts" | Where-Object { $_.FullName -notlike "*environment.service.ts" }

foreach ($file in $filesList) {
    $content = Get-Content -Path $file.FullName -Raw
    $original = $content
    
    # Check if file has localhost references
    if ($content -match "localhost:5000") {
        Write-Host "Updating $($file.FullName)"
        
        # Add import if needed
        if (-not ($content -match "import.*EnvironmentService")) {
            $content = $content -replace "import \{(.*?)\} from '(.*?)';", "import {`$1} from '`$2'`nimport { EnvironmentService } from '../../../core/services/environment.service';"
        }
        
        # Update constructor
        if ($content -match "constructor\((.*?)\)") {
            $constructor = $Matches[0]
            if (-not ($constructor -match "envService")) {
                $content = $content -replace "constructor\((.*?)\)", "constructor(`$1, private envService: EnvironmentService)"
            }
        }
        
        # Replace URLs
        $content = $content -replace "['`"]http://localhost:5000/uploads/1747396263436_2855267.jpg['`"]", "this.envService.getFallbackImageUrl()"
        $content = $content -replace "['`"]http://localhost:5000/uploads/(.*?)['`"]", "this.envService.getUploadsUrl('`$1')"
        $content = $content -replace "`"http://localhost:5000/uploads/`"", "this.envService.getBaseUrl() + '/uploads/'"
        
        # Update only if changes were made
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content
            Write-Host "Updated $($file.FullName)"
        }
    }
}

Write-Host "All files updated successfully!"
