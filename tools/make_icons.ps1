<#
  앱 아이콘 만들기 (윈도우 PowerShell, 추가 설치 필요 없음)

      powershell -ExecutionPolicy Bypass -File tools\make_icons.ps1

  icons\logo-source.png (원본 로고)에서 초록색 그림 부분만 잘라 내어
  흰 바탕 위 가운데에 놓고, PWA 에 필요한 크기별 아이콘을 만들어요.
  로고를 바꾸고 싶으면 logo-source.png 를 새 그림으로 바꾼 뒤 다시 실행하세요.
#>
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$icons = Join-Path $root 'icons'
$src = [System.Drawing.Bitmap]::FromFile((Join-Path $icons 'logo-source.png'))

# 1) 초록색 그림이 있는 범위 찾기
$minX = $src.Width; $minY = $src.Height; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $src.Height; $y++) {
  for ($x = 0; $x -lt $src.Width; $x++) {
    $c = $src.GetPixel($x, $y)
    if ($c.G -gt $c.R + 40 -and $c.G -gt $c.B + 40) {
      if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$m = 4  # 가장자리 여유
$crop = New-Object System.Drawing.Rectangle ([Math]::Max(0, $minX - $m)), ([Math]::Max(0, $minY - $m)), ($maxX - $minX + 2 * $m), ($maxY - $minY + 2 * $m)
Write-Host "로고 범위: $crop"

function New-RoundedPath([float]$w, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = 2 * $r
  $p.AddArc(0, 0, $d, $d, 180, 90)
  $p.AddArc($w - $d, 0, $d, $d, 270, 90)
  $p.AddArc($w - $d, $w - $d, $d, $d, 0, 90)
  $p.AddArc(0, $w - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

# 2) 아이콘 만들기: size(픽셀), pad(여백 비율), rounded(모서리 둥글게 + 바깥 투명)
function Save-Icon([string]$name, [int]$size, [double]$pad, [bool]$rounded) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)
  if ($rounded) {
    $g.FillPath([System.Drawing.Brushes]::White, (New-RoundedPath $size ($size * 0.22)))
  } else {
    $g.Clear([System.Drawing.Color]::White)
  }
  $box = $size * (1 - 2 * $pad)
  $scale = [Math]::Min($box / $crop.Width, $box / $crop.Height)
  $w = $crop.Width * $scale; $h = $crop.Height * $scale
  $dest = New-Object System.Drawing.RectangleF (($size - $w) / 2), (($size - $h) / 2), $w, $h
  $g.DrawImage($src, $dest, $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $bmp.Save((Join-Path $icons $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "만듦: icons\$name"
}

Save-Icon 'icon-192.png' 192 0.12 $true
Save-Icon 'icon-512.png' 512 0.12 $true
Save-Icon 'icon-maskable-512.png' 512 0.20 $false   # 안드로이드가 원·물방울 모양으로 잘라 쓰는 아이콘 (가운데 80% 안에 그림)
Save-Icon 'apple-touch-icon.png' 180 0.12 $false    # 아이폰은 스스로 모서리를 깎아요
Save-Icon 'favicon-48.png' 48 0.08 $true            # 브라우저 탭 아이콘

$src.Dispose()
