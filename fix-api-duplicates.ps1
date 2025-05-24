# Script to fix duplicate apiUrls imports in main-home.component.ts
$mainHomeFile = "src\app\features\home\main-home.component.ts"
$content = Get-Content $mainHomeFile -Raw

# Create completely new content with only one apiUrls import
$newContent = @"
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Vehicle } from '../../core/interfaces/vehicle.interface';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';
import { environment } from '../../../environments/environment';
import { apiUrls } from '../../utils/api-urls';

"@

# Extract the rest of the file content after imports
$startPos = $content.IndexOf("// Customer review interface")
if ($startPos -gt 0) {
    $remainingContent = $content.Substring($startPos)
    $newContent += $remainingContent
    
    # Write the updated content back to the file
    Set-Content -Path $mainHomeFile -Value $newContent -Encoding UTF8
    Write-Host "Fixed apiUrls imports in $mainHomeFile"
} else {
    Write-Host "Could not find the expected pattern in $mainHomeFile"
}
