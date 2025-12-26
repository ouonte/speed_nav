Add-Type -AssemblyName System.Drawing

# Create a simple square icon with a blue background and white center
function Create-Icon($size, $outputPath) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Set smoothing mode for better quality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    # Fill background with blue color
    $backgroundColor = [System.Drawing.Color]::FromArgb(74, 144, 226) # #4A90E2
    $graphics.FillRectangle([System.Drawing.SolidBrush]::new($backgroundColor), 0, 0, $size, $size)
    
    # Draw white center square with opacity
    $opacity = 0.3
    $whiteColor = [System.Drawing.Color]::FromArgb([int]($opacity * 255), 255, 255, 255)
    $graphics.FillRectangle([System.Drawing.SolidBrush]::new($whiteColor), $size/4, $size/4, $size/2, $size/2)
    
    # Draw smaller white square
    $graphics.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::White), $size*3/8, $size*3/8, $size/4, $size/4)
    
    # Draw cross lines
    $pen = [System.Drawing.Pen]::new($backgroundColor, $size/8)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    
    # Vertical line
    $graphics.DrawLine($pen, $size/2, $size/6, $size/2, $size*5/6)
    
    # Horizontal line
    $graphics.DrawLine($pen, $size/6, $size/2, $size*5/6, $size/2)
    
    # Save the bitmap as PNG
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Clean up
    $graphics.Dispose()
    $bitmap.Dispose()
    $pen.Dispose()
}

# Create icons for different sizes
Create-Icon -size 16 -outputPath "./icons/icon16.png"
Create-Icon -size 32 -outputPath "./icons/icon32.png"
Create-Icon -size 48 -outputPath "./icons/icon48.png"
Create-Icon -size 128 -outputPath "./icons/icon128.png"

Write-Host "Icons created successfully!"