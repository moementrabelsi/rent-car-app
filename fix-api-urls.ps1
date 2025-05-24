$root = ".\src"
$filesList = Get-ChildItem -Path $root -Recurse -Filter "*.ts" | Where-Object { 
    $_.FullName -notlike "*api-urls.ts" -and 
    $_.FullName -notlike "*environment.ts" -and
    $_.FullName -notlike "*environment.prod.ts" 
}

foreach ($file in $filesList) {
    $content = Get-Content -Path $file.FullName -Raw
    $original = $content
    
    # Check if file has localhost references
    if ($content -match "localhost:5000") {
        Write-Host "Updating $($file.FullName)"
        
        # Add import if needed
        if (-not ($content -match "import.*apiUrls")) {
            $content = $content -replace "import \{(.*?)\} from '(.*?)';", "import {`$1} from '`$2'`nimport { apiUrls } from '../../utils/api-urls';"
        }
        
        # Remove EnvironmentService if imported
        $content = $content -replace "import \{ EnvironmentService \} from '.*?';`n", ""
        
        # Remove envService from constructor
        $content = $content -replace "constructor\((.*?), private envService: EnvironmentService(.*?)\)", "constructor(`$1`$2)"
        
        # Replace URLs and method calls
        $content = $content -replace "this\.envService\.getFallbackImageUrl\(\)", "apiUrls.fallbackImageUrl"
        $content = $content -replace "this\.envService\.getUploadsUrl\((.*?)\)", "apiUrls.getUploadUrl(`$1)"
        $content = $content -replace "this\.envService\.getBaseUrl\(\)", "apiUrls.baseUrl"
        $content = $content -replace "this\.envService\.getApiUrl\(\)", "apiUrls.apiUrl"
        
        # Replace direct hardcoded URLs
        $content = $content -replace "['`"]http://localhost:5000/uploads/1747396263436_2855267\.jpg['`"]", "apiUrls.fallbackImageUrl"
        $content = $content -replace "['`"]http://localhost:5000/uploads/(.*?)['`"]", "apiUrls.getUploadUrl('`$1')"
        $content = $content -replace "['`"]http://localhost:5000['`"]", "apiUrls.baseUrl"
        $content = $content -replace "['`"]http://localhost:5000/api['`"]", "apiUrls.apiUrl"
        
        # Fix fallback URL references
        $content = $content -replace "const fallbackImage = apiUrls.fallbackImageUrl", "const fallbackImage = apiUrls.fallbackImageUrl"
        
        # Update only if changes were made
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content
            Write-Host "Updated $($file.FullName)"
        }
    }
}

Write-Host "All files updated successfully!"
