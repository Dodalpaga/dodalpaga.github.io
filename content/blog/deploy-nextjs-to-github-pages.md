---
title: 'Deploying a Next.js Static Website to GitHub Pages'
description: 'Step-by-step guide to deploy your Next.js static site using GitHub Pages'
image: 'https://miro.medium.com/v2/resize:fit:1400/1*2CW2GABDQgu1Fj6N0GkHew.png'
date: '2024-10-22'
---

<div style="display:flex; justify-content:center;">
  <img style="border-radius: 20px; max-height:300px" src="https://miro.medium.com/v2/resize:fit:1400/1*2CW2GABDQgu1Fj6N0GkHew.png" alt="Deployment Header Image" height="50%">
</div>

# Introduction

In this article, we'll walk you through the process of deploying a **Next.js static website** to **GitHub Pages**. From setting up your project to configuring GitHub Pages, this comprehensive guide will help you get your site live and accessible to the world.

---

# Table of Contents

- [Introduction](#introduction)
- [Table of Contents](#table-of-contents)
- [Requirements](#requirements)
- [Setting Up the Next.js Project](#setting-up-the-nextjs-project)
- [Next Js configuration](#next-js-configuration)
- [Setting up GitHub Pages](#setting-up-github-pages)
- [Deploying the Static Website](#deploying-the-static-website)
- [Managing Secrets in GitHub Pages](#managing-secrets-in-github-pages)
- [Conclusion](#conclusion)
  - [For more information on GitHub Pages action integration, refer to https://github.com/webmasterish/actions](#for-more-information-on-github-pages-action-integration-refer-to-httpsgithubcomwebmasterishactions)

---

# Requirements

Before we begin, ensure you have the following tools installed:

- [Node.js](https://nodejs.org/en/) (v14 or later)
- [Git](https://git-scm.com/)
- A GitHub account

Optional:

- A domain name (if you plan to use a custom domain for your GitHub Pages site)

# Setting Up the Next.js Project

The first step is to create a **Next.js** project and prepare it for static export.

```bash
npx create-next-app@latest my-static-site
cd my-static-site
npm run dev
```

# Next Js configuration

<h5 a>
  <strong>
    <code>next.config.js</code>
  </strong>
</h5>

```js filename="index.js"
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

Then you can export your website :

```bash
npm run build && npm run export
```

The output will be saved in the `out` directory. You can then deploy it to GitHub Pages by creating a new repository and pushing the contents of the `out` directory to the `main` branch.

# Setting up GitHub Pages

Once you have the static files ready, it's time to push them to GitHub and configure GitHub Pages.

Create a repository on GitHub and clone it:

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

Copy the contents of the out/ folder into your repository.

Add a .nojekyll file to the root of your repository:

```bash
touch .nojekyll
```

This prevents GitHub Pages from ignoring files that begin with underscores, which is necessary for Next.js projects.

Push the changes to your repository:

```bash
git add .
git commit -m "Deploy static Next.js site"
git push origin main
```

# Deploying the Static Website

Now, let's enable GitHub Pages for your repository:

- Go to the Settings tab of your GitHub repository.
- Scroll down to the Pages section.
- Under Branch, select main as the source and set the folder to /root.
- Save the settings, and GitHub will build and deploy your site.

You can now visit your site at `https://username.github.io/your-repo-name`.

Note that if your repository name is already `username.github.io`, your wedbsite will be available at the address `https://username.github.io`

# Managing Secrets in GitHub Pages

When deploying applications, it's crucial to handle sensitive information, such as API keys or access tokens, securely. GitHub Pages does not support server-side code execution, meaning you can't store secrets directly in your application code or rely on environment variables as you would in a typical server environment.

However, you can manage secrets using **GitHub Actions** to securely build and deploy your site. Here's how to do it:

1. **Define Secrets in Your Repository**:

   - Go to your GitHub repository, click on the **Settings** tab, and then find the **Secrets and variables** section.
   - Click on **Actions** and then **New repository secret**.
   - Add your secrets (e.g., `API_KEY`, `DATABASE_URL`) with appropriate names and values.

   </br>

   > Environment Variables Without NEXT_PUBLIC\_ :

   Variables that do not have the NEXT_PUBLIC\_ prefix are only accessible in server-side code. They will not be included in the client-side bundle, so you cannot use them in your components or pages that run in the browser.

   </br>

   > Environment Variables With NEXT_PUBLIC\_ :

   Variables prefixed with NEXT_PUBLIC\_ are exposed to the browser, allowing you to access them in your React components or anywhere in your application that runs on the client side.

   </br>

   **Example**
   Setting Environment Variables: You might define your environment variables in a `.env.local` file like this :

   ```txt
   NEXT_PUBLIC_API_URL=https://api.example.com
   API_SECRET=supersecretvalue
   ```

2. **Using secrets in Next.js**:
   You can access these variables in your components as follows:

   ```javascript
   // Accessing public variable
   const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Available on client-side

   // Accessing private variable
   const apiSecret = process.env.API_SECRET; // Only available on server-side
   ```

   **Summary**

   - Prefix: Use NEXT_PUBLIC\_ for variables needed in the client-side code.
   - No Prefix: Variables without this prefix are only available on the server-side.

3. **Using Secrets in GitHub Actions**:

   - Create a `.github/workflows/nextjs.yml` file in your repository.
   - In your GitHub Actions workflow file, you can reference these secrets
     Here’s an example:

   ```yaml
   name: Deploy Next.js site to Pages

   on:
     push:
       branches: ['main']
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: 'pages'
     cancel-in-progress: false

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Detect package manager
           id: detect-package-manager
           run: |
             if [ -f "${{ github.workspace }}/yarn.lock" ]; then
               echo "manager=yarn" >> $GITHUB_OUTPUT
               echo "command=install" >> $GITHUB_OUTPUT
               echo "runner=yarn" >> $GITHUB_OUTPUT
               exit 0
             elif [ -f "${{ github.workspace }}/package.json" ]; then
               echo "manager=npm" >> $GITHUB_OUTPUT
               echo "command=ci" >> $GITHUB_OUTPUT
               echo "runner=npx --no-install" >> $GITHUB_OUTPUT
               exit 0
             else
               echo "Unable to determine package manager"
               exit 1
             fi

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: ${{ steps.detect-package-manager.outputs.manager }}

         - name: Setup Pages
           uses: actions/configure-pages@v5
           with:
             static_site_generator: next

         - name: Restore cache
           uses: actions/cache@v4
           with:
             path: .next/cache
             key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
             restore-keys: |
               ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}-

         - name: Install dependencies
           run: ${{ steps.detect-package-manager.outputs.manager }} ${{ steps.detect-package-manager.outputs.command }}

         - name: Debug Secrets
           run: |
             echo "NEXT_PUBLIC_API_URL_DOCS: ${{ secrets.NEXT_PUBLIC_API_URL_DOCS }}"
             echo "NEXT_PUBLIC_MAPTILER_API_KEY: ${{ secrets.NEXT_PUBLIC_MAPTILER_API_KEY }}"

         - name: Build with Next.js
           run: ${{ steps.detect-package-manager.outputs.runner }} next build
           env:
             NEXT_PUBLIC_API_URL_DOCS: ${{ secrets.NEXT_PUBLIC_API_URL_DOCS }}
             NEXT_PUBLIC_MAPTILER_API_KEY: ${{ secrets.NEXT_PUBLIC_MAPTILER_API_KEY }}

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: ./out

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

4. **Accessing Secrets in TypeScript**:

   Since the deployed site runs in the browser, you cannot directly access the secrets defined in GitHub. However, you can make use of them during the build process. In your TypeScript code, you can access environment variables through the process.env object during build time, like this:

   ```typescript
   const apiKey = process.env.API_KEY;
   ```

   Make sure you replace any references to sensitive data in your client-side code with environment variables during the build process.

Using GitHub Actions to manage secrets keeps your sensitive data secure and allows you to maintain clean code without hardcoding credentials. Remember to never expose your secrets in client-side code, as it can lead to security vulnerabilities.

# Conclusion

Deploying a Next.js static site to GitHub Pages is straightforward with the proper configuration. This setup allows you to host your projects for free while leveraging Next.js' static generation capabilities. If you run into issues, make sure to double-check your GitHub Pages settings and the static export configuration in Next.js.

Happy deploying!

## For more information on GitHub Pages action integration, refer to https://github.com/webmasterish/actions
