# Image Setup Guide

## Quick Setup - Download Images

### Step 1: Create Image Folders

```bash
# Run from project root
mkdir -p client/public/images/landing
mkdir -p client/public/images/dashboard
mkdir -p client/public/images/test
mkdir -p client/public/images/resources
mkdir -p client/public/images/errors
mkdir -p client/public/images/icons
```

### Step 2: Download Recommended Images

#### Landing Page Images

1. **Hero Image** (1920x1080)
   - Search: "students studying computer science"
   - Source: https://unsplash.com/s/photos/computer-science-education
   - Save as: `client/public/images/landing/hero-image.jpg`

2. **Success Image** (800x600)
   - Search: "achievement celebration"
   - Source: https://unsplash.com/s/photos/success-celebration
   - Save as: `client/public/images/landing/gate-success.jpg`

3. **Study Group** (800x600)
   - Search: "students studying together"
   - Source: https://unsplash.com/s/photos/study-group
   - Save as: `client/public/images/landing/study-group.jpg`

#### Dashboard Images

1. **Empty State** (SVG)
   - Source: https://undraw.co/search (search "empty")
   - Customize color: #667eea
   - Save as: `client/public/images/dashboard/empty-state.svg`

2. **Trophy** (PNG)
   - Source: https://www.flaticon.com/search?word=trophy
   - Save as: `client/public/images/dashboard/trophy.png`

3. **Achievement Badge** (PNG)
   - Source: https://www.flaticon.com/search?word=badge
   - Save as: `client/public/images/dashboard/achievement-badge.png`

#### Test Images

1. **Test Completed** (SVG)
   - Source: https://undraw.co/search (search "completed")
   - Save as: `client/public/images/test/test-completed.svg`

2. **Timer Icon** (PNG)
   - Source: https://www.flaticon.com/search?word=timer
   - Save as: `client/public/images/test/timer-icon.png`

#### Error Pages

1. **404 Page** (SVG)
   - Source: https://undraw.co/search (search "404")
   - Save as: `client/public/images/errors/404.svg`

2. **Error State** (SVG)
   - Source: https://undraw.co/search (search "error")
   - Save as: `client/public/images/errors/error.svg`

3. **No Connection** (SVG)
   - Source: https://undraw.co/search (search "connection")
   - Save as: `client/public/images/errors/no-connection.svg`

---

## Direct Download Links

### Free Illustration Sites

1. **unDraw** - https://undraw.co
   - Customizable SVG illustrations
   - No attribution required
   - Perfect for empty states and error pages

2. **Freepik** - https://www.freepik.com
   - Free vectors (with attribution)
   - Premium without attribution
   - Great for icons and illustrations

3. **Flaticon** - https://www.flaticon.com
   - Free icons (with attribution)
   - PNG, SVG formats
   - Consistent icon sets

### Free Photo Sites

1. **Unsplash** - https://unsplash.com
   - High-quality photos
   - No attribution required
   - Best for hero images

2. **Pexels** - https://www.pexels.com
   - Free stock photos
   - No attribution required
   - Good variety

3. **Pixabay** - https://pixabay.com
   - Free images and vectors
   - No attribution required
   - Large collection

---

## Specific Image Recommendations

### Landing Page Hero
**Recommended Image:**
- URL: https://unsplash.com/photos/person-using-macbook-pro-on-person-s-lap-5fNmWej4tAA
- Description: Student studying on laptop
- License: Free to use

### Dashboard Empty State
**Recommended Illustration:**
- URL: https://undraw.co/illustrations (search "data")
- Illustration: "No data" or "Empty"
- Color: #667eea (match your theme)

### 404 Error Page
**Recommended Illustration:**
- URL: https://undraw.co/illustrations (search "404")
- Illustration: "Page not found"
- Color: #667eea

---

## Image Optimization

### Online Tools

1. **TinyPNG** - https://tinypng.com
   - Compress JPG and PNG
   - Drag and drop
   - Free up to 20 images

2. **Squoosh** - https://squoosh.app
   - Google's image optimizer
   - Compare before/after
   - Multiple formats

3. **ImageOptim** - https://imageoptim.com (Mac only)
   - Desktop app
   - Batch processing
   - Lossless compression

### Recommended Settings

**For Photos (JPG):**
- Quality: 80-85%
- Progressive: Yes
- Target size: < 200KB

**For Illustrations (PNG):**
- Compression: Medium
- Target size: < 100KB

**For Icons (SVG):**
- Optimize with SVGO
- Remove unnecessary metadata
- Target size: < 10KB

---

## Implementation Example

### Update Landing Page with Hero Image

```jsx
// client/src/pages/Landing.jsx

// Add at the top of the component
<Box
  sx={{
    position: 'relative',
    height: '100vh',
    backgroundImage: 'url(/images/landing/hero-image.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
    }
  }}
>
  {/* Your existing content */}
</Box>
```

### Add Empty State to Dashboard

```jsx
// client/src/pages/Dashboard.jsx

{stats.testsCompleted === 0 && (
  <Box textAlign="center" py={8}>
    <img 
      src="/images/dashboard/empty-state.svg" 
      alt="No tests taken yet"
      style={{ width: '300px', height: 'auto', marginBottom: '24px' }}
    />
    <Typography variant="h6" gutterBottom>
      No tests taken yet
    </Typography>
    <Typography color="text.secondary" paragraph>
      Start your first mock test to see your progress here
    </Typography>
    <Button 
      variant="contained" 
      onClick={() => navigate('/dashboard/mock-test')}
    >
      Take Your First Test
    </Button>
  </Box>
)}
```

### Add 404 Page

```jsx
// client/src/pages/NotFound.jsx

import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
      p={3}
    >
      <img 
        src="/images/errors/404.svg" 
        alt="Page not found"
        style={{ width: '400px', height: 'auto', marginBottom: '32px' }}
      />
      <Typography variant="h3" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/dashboard')}
        size="large"
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;
```

---

## Checklist

### Required Images
- [ ] Landing hero image (1920x1080 JPG)
- [ ] Dashboard empty state (SVG)
- [ ] Test completed illustration (SVG)
- [ ] 404 error page (SVG)
- [ ] Trophy/achievement icon (PNG)

### Optional Images
- [ ] Success celebration image
- [ ] Study group image
- [ ] Timer icon
- [ ] Error state illustration
- [ ] No connection illustration
- [ ] Resource category images

### Optimization
- [ ] All images compressed
- [ ] File sizes under target
- [ ] Alt text added
- [ ] Lazy loading implemented
- [ ] Responsive sizing tested

---

## Quick Start Commands

```bash
# Create folders
cd client/public
mkdir -p images/{landing,dashboard,test,resources,errors,icons}

# Verify structure
ls -R images/

# After downloading images, verify sizes
du -sh images/*
```

---

## Support

If you need help finding or optimizing images:
1. Check the recommended sources above
2. Use the search terms provided
3. Follow the optimization guidelines
4. Test images in the app before committing

---

**Note**: Always respect image licenses and provide attribution when required.
