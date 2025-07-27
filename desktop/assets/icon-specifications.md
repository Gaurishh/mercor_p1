# Icon Specifications for Inciteful Desktop App

## Required Icon Files

### 1. icon.ico (Windows)

- **Size**: 256x256 pixels (minimum)
- **Format**: ICO (Windows icon format)
- **Design**: Blue gradient circle with white "I" letter
- **Usage**: Windows installer and taskbar

### 2. icon.icns (macOS)

- **Size**: 512x512 pixels (minimum)
- **Format**: ICNS (macOS icon format)
- **Design**: Blue gradient circle with white "I" letter
- **Usage**: macOS installer and dock

### 3. icon.png (Linux)

- **Size**: 512x512 pixels
- **Format**: PNG
- **Design**: Blue gradient circle with white "I" letter
- **Usage**: Linux AppImage and desktop shortcuts

## Design Specifications

### Colors

- **Primary Blue**: #3B82F6 (start of gradient)
- **Secondary Blue**: #1D4ED8 (end of gradient)
- **Border Blue**: #1E40AF
- **Text Color**: White (#FFFFFF)

### Design Elements

1. **Background**: Circular gradient from light blue to dark blue
2. **Border**: Dark blue stroke around the circle
3. **Letter**: Bold white "I" centered in the circle
4. **Glow**: Subtle inner white glow for depth

## Conversion Tools

### Online Converters

1. **SVG to PNG**: https://convertio.co/svg-png/
2. **PNG to ICO**: https://convertio.co/png-ico/
3. **PNG to ICNS**: https://cloudconvert.com/png-to-icns

### Desktop Software

1. **GIMP** (Free): Can convert between formats
2. **Inkscape** (Free): Great for SVG editing
3. **Photoshop**: Professional image editing
4. **Sketch**: macOS design tool

### Command Line (if you have ImageMagick)

```bash
# Convert SVG to PNG
convert icon.svg -resize 512x512 icon.png

# Convert PNG to ICO (Windows)
convert icon.png -resize 256x256 icon.ico

# Convert PNG to ICNS (macOS)
# Note: ICNS conversion is more complex and may require specialized tools
```

## Steps to Create Icons

### Step 1: Use the SVG as Base

The `icon.svg` file I created contains the proper design. Use this as your starting point.

### Step 2: Convert to PNG

1. Open the SVG in a browser or image editor
2. Export/save as PNG at 512x512 pixels
3. Save as `icon.png`

### Step 3: Convert to ICO (Windows)

1. Use an online converter or ImageMagick
2. Convert the PNG to ICO format
3. Ensure it's at least 256x256 pixels
4. Save as `icon.ico`

### Step 4: Convert to ICNS (macOS)

1. Use a specialized ICNS converter
2. Convert the PNG to ICNS format
3. Save as `icon.icns`

## Alternative: Use Icon Generator Tools

### For Windows ICO

- **IcoFX**: Professional icon editor
- **Greenfish Icon Editor Pro**: Free alternative

### For macOS ICNS

- **Icon Composer** (part of Xcode)
- **Image2Icon**: Online converter

### For All Platforms

- **Figma**: Design and export in multiple formats
- **Adobe Illustrator**: Professional vector editing

## Final File Structure

```
desktop/assets/
├── icon.svg          # Base SVG design
├── icon.png          # 512x512 PNG for Linux
├── icon.ico          # Windows icon
├── icon.icns         # macOS icon
└── icon-specifications.md  # This file
```

## Testing Your Icons

After creating the icons:

1. Test the ICO file by setting it as a Windows shortcut icon
2. Test the ICNS file by setting it as a macOS app icon
3. Test the PNG file by using it in a Linux desktop environment
