# Deploy to GitHub Pages

## Prerequisites
- GitHub account
- Git installed
- Repository created on GitHub

## Steps to Deploy

### 1. Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `portfolio-website`
3. Make it **Public** (required for GitHub Pages)
4. Don't initialize with README (you already have files)
5. Click "Create repository"

### 3. Connect to GitHub
```bash
git remote add origin https://github.com/miFu278/portfolio-website.git
git branch -M main
git push -u origin main
```

### 4. Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
- Build your project (`npm run build`)
- Create a `gh-pages` branch
- Push the `dist` folder to that branch
- Deploy automatically

### 5. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select branch: `gh-pages`
4. Click **Save**
5. Wait 1-2 minutes

### 6. Access Your Site
Your portfolio will be live at:
```
https://miFu278.github.io/portfolio-website/
```

## Update Your Site

Whenever you make changes:

```bash
# 1. Commit your changes
git add .
git commit -m "Update portfolio"
git push

# 2. Deploy
npm run deploy
```

## Troubleshooting

### Site shows 404
- Make sure repository is **Public**
- Check GitHub Pages settings
- Wait a few minutes after deploy

### Images/Assets not loading
- Check `vite.config.ts` has correct `base` path
- Verify `homepage` in `package.json` matches your repo name

### Deploy fails
```bash
# Clear cache and try again
rm -rf dist
npm run build
npm run deploy
```

### Want custom domain?
1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. Add `CNAME` file to `public/` folder with your domain
3. Configure DNS settings at your domain provider
4. Update GitHub Pages settings

## Environment Variables

**Important:** Don't commit `.env` file!

For GitHub Pages, you need to:
1. Keep `.env` in `.gitignore`
2. Add environment variables in GitHub Secrets (for CI/CD)
3. Or hardcode them (not recommended for sensitive data)

For EmailJS, it's safe to expose public keys in frontend.

## Custom Domain (Optional)

If you want `phucttm.dev` instead of `miFu278.github.io`:

1. Create file `public/CNAME`:
```
phucttm.dev
```

2. Update `package.json`:
```json
"homepage": "https://phucttm.dev"
```

3. Update `vite.config.ts`:
```ts
base: '/'
```

4. Configure DNS at your domain provider:
```
Type: A
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153

Type: CNAME
Name: www
Value: miFu278.github.io
```

5. Deploy: `npm run deploy`

## Notes

- First deploy takes 1-2 minutes
- Updates are usually instant
- Free hosting with GitHub Pages
- 100GB bandwidth/month
- 1GB storage limit
