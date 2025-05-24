$root = ".\src\app"
$apiUrlPath = "/utils/api-urls"
$filesList = Get-ChildItem -Path $root -Recurse -Filter "*.ts" | Where-Object { 
    $_.FullName -notlike "*api-urls.ts" -and 
    $_.FullName -notlike "*environment.ts" -and
    $_.FullName -notlike "*environment.prod.ts" 
}

foreach ($file in $filesList) {
    $content = Get-Content -Path $file.FullName -Raw
    $original = $content
    
    # Fix path to apiUrls based on file location
    $relativePath = [regex]::Match($file.FullName, "src\\app\\(.+)\\").Groups[1].Value
    $depthLevel = ($relativePath.Split("\").Count)
    $correctPath = "../" * $depthLevel + "utils/api-urls"
    
    # Remove duplicate imports - Environment Service
    $content = $content -replace "(import \{ EnvironmentService \} from '.*?';[\r\n]+)+", ""
    
    # Remove duplicate imports - apiUrls
    $content = $content -replace "(import \{ apiUrls \} from '.*?';[\r\n]+)+", ""
    
    # Add correct import if needed
    if ($content -match "localhost:5000" -and -not ($content -match "import.*apiUrls")) {
        # Insert import at the top, after the last import statement
        $content = $content -replace "^(import .+;\r?\n)(?!import)", "`$1import { apiUrls } from '$correctPath';\r`n"
    }
    
    # Replace instances of envService with apiUrls
    $content = $content -replace "this\.envService\.getFallbackImageUrl\(\)", "apiUrls.fallbackImageUrl"
    $content = $content -replace "this\.envService\.getUploadsUrl\((.*?)\)", "apiUrls.getUploadUrl(`$1)"
    $content = $content -replace "this\.envService\.getBaseUrl\(\)", "apiUrls.baseUrl"
    $content = $content -replace "this\.envService\.getApiUrl\(\)", "apiUrls.apiUrl"
    
    # Remove envService from constructors
    $content = $content -replace ",\s*private\s+envService\s*:\s*EnvironmentService", ""
    
    # Replace hardcoded URLs
    $content = $content -replace "['`"]http://localhost:5000/uploads/1747396263436_2855267\.jpg['`"]", "apiUrls.fallbackImageUrl"
    $content = $content -replace "['`"]http://localhost:5000/uploads/", "apiUrls.uploadsUrl + '/"
    $content = $content -replace "['`"]http://localhost:5000['`"]", "apiUrls.baseUrl"
    $content = $content -replace "['`"]http://localhost:5000/api['`"]", "apiUrls.apiUrl"
    
    # Update only if changes were made
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated $($file.FullName)"
    }
}

Write-Host "All files updated successfully!"
