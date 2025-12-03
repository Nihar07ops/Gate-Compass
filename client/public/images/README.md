# Images Folder

This folder contains all images used in the GateCompass application.

## Folder Structure

```
images/
├── landing/        # Landing page images (hero, features)
├── dashboard/      # Dashboard illustrations (empty states, achievements)
├── test/           # Test-related images (completion, timer)
├── resources/      # Resource section images (books, videos)
├── errors/         # Error page illustrations (404, error states)
└── icons/          # App icons (logo, favicon)
```

## Image Guidelines

### File Naming
- Use lowercase with hyphens: `hero-image.jpg`
- Be descriptive: `test-completed.svg`
- Include size if multiple versions: `logo-small.png`, `logo-large.png`

### File Formats
- **Photos**: JPG (smaller file size)
- **Illustrations**: SVG (scalable) or PNG (with transparency)
- **Icons**: SVG preferred

### File Sizes
- Hero images: < 200KB
- Illustrations: < 100KB
- Icons: < 50KB

### Dimensions
- Hero images: 1920x1080 or 1600x900
- Card images: 800x600 or 600x400
- Icons: 200x200 or 150x150
- Thumbnails: 300x200

## Required Images

### High Priority
1. `landing/hero-image.jpg` - Main landing page hero
2. `dashboard/empty-state.svg` - Dashboard empty state
3. `errors/404.svg` - 404 error page
4. `icons/logo.svg` - App logo

### Medium Priority
5. `dashboard/trophy.png` - Achievement icon
6. `test/test-completed.svg` - Test completion
7. `errors/error.svg` - General error state

### Low Priority
8. `landing/gate-success.jpg` - Success stories
9. `resources/book-stack.jpg` - Study materials
10. `test/timer-icon.png` - Timer visual

## Image Sources

### Free Resources
- **Unsplash**: https://unsplash.com (photos)
- **unDraw**: https://undraw.co (illustrations)
- **Pexels**: https://pexels.com (photos)
- **Flaticon**: https://flaticon.com (icons)

### Optimization Tools
- **TinyPNG**: https://tinypng.com
- **Squoosh**: https://squoosh.app
- **ImageOptim**: https://imageoptim.com

## Usage in Code

```jsx
// Public folder image
<img src="/images/landing/hero-image.jpg" alt="Hero" />

// With Material-UI
<Box
  component="img"
  src="/images/dashboard/trophy.png"
  alt="Achievement"
  sx={{ width: 150, height: 150 }}
/>

// Background image
<Box
  sx={{
    backgroundImage: 'url(/images/landing/hero-image.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
/>
```

## Notes

- All images should have descriptive alt text
- Optimize images before adding to repository
- Use lazy loading for large images
- Test images on different screen sizes
- Respect image licenses and provide attribution when required

## Setup Guide

See `scripts/setup-images.md` for detailed setup instructions and download links.

---

**Last Updated**: November 29, 2025
