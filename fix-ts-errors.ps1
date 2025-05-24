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
    
    # Fix FontAwesome import syntax errors
    if ($content -match "\}\s+from\s+'@fortawesome/free") {
        # Extract all the import lines
        $faImportMatch = [regex]::Match($content, "import\s+\{\s+([\s\S]+?)\s*\}\s+from\s+'(@fortawesome/[^']+)';")
        if ($faImportMatch.Success) {
            $importItems = $faImportMatch.Groups[1].Value -split ',\s*' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
            $importSource = $faImportMatch.Groups[2].Value
            $newImport = "import { " + ($importItems -join ", ") + " } from '$importSource';"
            $content = $content -replace [regex]::Escape($faImportMatch.Value), $newImport
        }
    }
    
    # Fix HTTP imports in auth.interceptor.ts
    if ($fileName -eq "auth.interceptor.ts") {
        $content = $content -replace "import \{\s+HttpRequest,\s+HttpHandlerFn,\s+HttpInterceptorFn,\s+HttpErrorResponse\s+\} from '@angular/common/http';", 
                              "import { HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';"
    }
    
    # Check if the file uses apiUrls
    if ($content -match "apiUrls\." -and -not ($content -match "import.*apiUrls")) {
        # Get the correct relative path to utils/api-urls
        $filePath = $file.FullName
        $appIndex = $filePath.IndexOf("\src\app\")
        $relativePath = $filePath.Substring($appIndex + 9)  # Skip "\src\app\"
        $folderDepth = ($relativePath.Split("\").Count) - 1  # -1 for the file itself
        
        # Create the correct import path
        $importPath = "../" * $folderDepth + "utils/api-urls"
        
        # Add the import statement after the last import
        if ($content -match "import .+;[\r\n]+(?!import)") {
            $content = $content -replace "(import .+;[\r\n]+)(?!import)", "`$1import { apiUrls } from '$importPath';`r`n"
        } else {
            # If no imports found, add at the top
            $content = "import { apiUrls } from '$importPath';`r`n" + $content
        }
    }
    
    # Write the updated content back to the file
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated $fileName"
    }
}

Write-Host "All files updated successfully!"
