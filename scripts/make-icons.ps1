<#
.SYNOPSIS
  Regenerate the favicon set from the source portrait.

.DESCRIPTION
  The source is a 1024x1024 illustration. Shipping it directly as the tab icon
  would mean every visitor downloads ~229KB for something rendered at 16-32px.
  This centre-crops it square, downsamples with high-quality bicubic, and writes
  the sizes actually referenced from index.html / site.webmanifest.

  Run after replacing src/assets/mp-chibi.jpg:
    pnpm icons        (or: powershell -File scripts/make-icons.ps1)

  Uses System.Drawing, so no image dependency is added to the project.
#>

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $root 'src\assets\mp-chibi.jpg'
$outDir = Join-Path $root 'public'

if (-not (Test-Path $sourcePath)) {
  throw "Source image not found: $sourcePath"
}

$img = [System.Drawing.Image]::FromFile($sourcePath)
Write-Host "source  $sourcePath  ($($img.Width) x $($img.Height))"

# Square crop from the centre, so a non-square source still yields a valid icon.
$side = [Math]::Min($img.Width, $img.Height)
$cropX = [int](($img.Width - $side) / 2)
$cropY = [int](($img.Height - $side) / 2)

function New-SquareBitmap {
  param([System.Drawing.Image]$Source, [int]$Size, [int]$CropX, [int]$CropY, [int]$CropSide)

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  $dest = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
  $g.DrawImage($Source, $dest, $CropX, $CropY, $CropSide, $CropSide, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  return $bmp
}

foreach ($size in 16, 32, 48, 180, 192, 512) {
  $bmp = New-SquareBitmap -Source $img -Size $size -CropX $cropX -CropY $cropY -CropSide $side
  $target = Join-Path $outDir "favicon-$size.png"
  $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host ("output  favicon-{0}.png  {1:N0} bytes" -f $size, (Get-Item $target).Length)
}

# A bare /favicon.ico request should not 404, even though every modern browser
# prefers the PNG entries in index.html.
$icoBmp = New-SquareBitmap -Source $img -Size 32 -CropX $cropX -CropY $cropY -CropSide $side
$ico = [System.Drawing.Icon]::FromHandle($icoBmp.GetHicon())
$icoPath = Join-Path $outDir 'favicon.ico'
$stream = [System.IO.File]::Create($icoPath)
$ico.Save($stream)
$stream.Close()
$icoBmp.Dispose()
Write-Host ("output  favicon.ico  {0:N0} bytes" -f (Get-Item $icoPath).Length)

$img.Dispose()
Write-Host "done"
