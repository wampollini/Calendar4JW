$source = "app\src\main\res\drawable\ic_launcher1024.png"
$sizes = @{
    "mipmap-ldpi" = 36
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

Add-Type -AssemblyName System.Drawing

$sourceImg = [System.Drawing.Image]::FromFile((Resolve-Path $source).Path)

foreach ($folder in $sizes.Keys) {
    $size = $sizes[$folder]
    $destFolder = "app\src\main\res\$folder"
    $destPath = "$destFolder\ic_launcher.png"
    
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($sourceImg, 0, 0, $size, $size)
    
    $fullPath = (Resolve-Path $destFolder).Path + "\ic_launcher.png"
    $bitmap.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $bitmap.Dispose()
    $graphics.Dispose()
    
    Write-Host "✓ Created $destPath ($size x $size)"
}

$sourceImg.Dispose()
Write-Host "`n✅ All icons generated successfully!"
