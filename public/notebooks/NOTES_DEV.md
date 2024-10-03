# Notes for jupyter html formatting :

I added this css to my notebooks html files :

```css
pre {
  line-height: 125%;
  white-space: pre-wrap;
  word-wrap: break-word;
}
```

This allows input word wrap which is not default.

I also added transparent background here :

```css
.jp-Notebook {
  padding: var(--jp-notebook-padding);
  outline: none;
  overflow: hidden;
  background-color: transparent;
}
```
