### How To Use

Include `dist/gephi-svg-interactive.js` or the minified version `dist/gephi-svg-interactive.min.js`.

`gephiSvgInteractive()` has to be used on an inline SVG. You can use e.g. [SVGInjector](https://github.com/iconic/SVGInjector/) to inline SVGs in your HTML.

```javascript
$(yourSvgElement).gephiSvgInteractive({
    class: 'svg-gephi-interactive', // class to apply to each interactive SVG. Default: null (will not add class)
    cursor: 'crosshair' // cursor type to be displayed when hovering over active elements. Default: 'pointer'
})
```

See [`demo/index.html`](https://github.com/jonasjancarik/gephi-svg-interactive/blob/master/demo/index.html) [(web view)](http://htmlpreview.github.io/?https://github.com/jonasjancarik/gephi-svg-interactive/blob/master/demo/index.html) for an example.

### Build

`npm run build` simply copies gephi-svg-interactive.js from the ./src/ folder to ./dist/ and creates a minified version in the same directory. It will not work in Windows CMD or PowerShell (it uses &&), but you can run it using the [Windows 10 bash shell](https://docs.microsoft.com/en-us/windows/wsl/install-win10).