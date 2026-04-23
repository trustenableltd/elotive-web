# Frontend Public Repo Deployment

## 1. Create a public repository
Create a new public repository named `elotive-web` under your GitHub org.

## 2. Push this folder
```bash
git init
git add .
git commit -m "Initial public frontend"
git branch -M main
git remote add origin https://github.com/trustenableltd/elotive-web.git
git push -u origin main
```

## 3. Enable GitHub Pages
- Repository Settings -> Pages
- Source: GitHub Actions
- Custom domain: `elotive.com`
- Enable HTTPS after DNS propagation

## 4. DNS on Fasthost
- A records for `elotive.com`:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- CNAME for `www` -> `trustenableltd.github.io`

## 5. Backend
Host backend separately at `api.elotive.com`.
