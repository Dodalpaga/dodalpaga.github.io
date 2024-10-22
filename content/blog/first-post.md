---
title: 'Deploying a Next.js Static Website to GitHub Pages'
description: 'Step-by-step guide to deploy your Next.js static site using GitHub Pages'
image: 'https://via.placeholder.com/1200x600'
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
