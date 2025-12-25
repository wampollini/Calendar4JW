Add-Type -AssemblyName System.Drawing

$sourcePath = "app\src\main\res\drawable\ic_launcher1024.png"
$sourceImg = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePath).Path)

# Crea una nuova immagine 1024x1024 con padding
$newSize = 1024
$padding = 150  # Margine in pixel
$contentSize = $newSize - (2 * $padding)

# Crea bitmap con sfondo
$bitmap = New-Object System.Drawing.Bitmap($newSize, $newSize)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Riempi con colore di fondo (bianco o il colore predominante)
$backgroundColor = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
$graphics.Clear($backgroundColor)

# Disegna l'immagine originale ridotta e centrata
$destRect = New-Object System.Drawing.Rectangle($padding, $padding, $contentSize, $contentSize)
$graphics.DrawImage($sourceImg, $destRect)

# Salva la nuova icona
$outputPath = "c:\progetti\calendar4jw\android\app\src\main\res\drawable\ic_launcher1024_new.png"
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
$sourceImg.Dispose()

Write-Host "✓ Created padded icon: ic_launcher1024.png"
Write-Host "  - Size: 1024x1024"
Write-Host "  - Padding: $padding px on each side"
Write-Host "  - Content area: $contentSize x $contentSize"
