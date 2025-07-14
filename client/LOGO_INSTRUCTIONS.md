# Adding SC Micro Logo

## Option 1: Using Public Folder (Recommended for simple setup)

1. Place your logo file in `client/public/` folder
2. Name it `logo.png` (or update the src path in Header.js)
3. Update `client/src/components/Header.js`:
   - Change `const hasLogo = false;` to `const hasLogo = true;`
   - Update the src path if your logo has a different name

## Option 2: Using Assets Folder (Better for optimization)

1. Place your logo file in `client/src/assets/` folder
2. Uncomment and update the import in `client/src/components/Header.js`:
   ```javascript
   import logoImage from '../assets/your-logo-file.png';
   ```
3. Update the img src to use the imported image:
   ```javascript
   <img 
     src={logoImage} 
     alt="SC Micro Logo" 
     className="logo-image"
   />
   ```
4. Change `const hasLogo = false;` to `const hasLogo = true;`

## Logo Requirements

- Recommended size: 40x40px or larger (will be scaled down)
- Format: PNG, SVG, or JPG
- Should have transparent background for best results
- The logo will be displayed with rounded corners and subtle shadow

## Current Setup

The header currently shows a placeholder with "SC" initials in a golden gradient. Once you add your logo file and set `hasLogo = true`, it will automatically switch to display your actual logo. 