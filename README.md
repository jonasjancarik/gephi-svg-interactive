Adds interactivity to Gephi-created SVGs in the browser.

- Click a node to highlight it (or rather dim all other nodes and unconnected edges)
- Click and drag labels to move nodes (and edges) around

### How To Use

Include `dist/gephi-svg-interactive.js` or the minified version `dist/gephi-svg-interactive.min.js`.

CDN and NPM support is coming.

Your SVGs have to be inlined before `gephiSvgInteractive()` can be used on them. You can use e.g. [SVGInjector](https://github.com/iconic/SVGInjector/) to inline SVGs in your HTML.

```javascript
$(yourSvgElement).gephiSvgInteractive({
    class: 'svg-gephi-interactive', // class to apply to each interactive SVG. Default: null (will not add class)
})
```

See [`demo/index.html`](https://github.com/jonasjancarik/gephi-svg-interactive/blob/master/demo/index.html) [(web view)](http://htmlpreview.github.io/?https://github.com/jonasjancarik/gephi-svg-interactive/blob/master/demo/index.html) for an example.

### Build

1. `git clone https://github.com/jonasjancarik/gephi-svg-interactive.git` to clone this repository
2. `npm run browserify` to create a new bundled file (via Browserify) in the `dist` folder
3. `npm run watch` to do the above whenever you save a changed src/*.js file
4. `npm run build` to create a bundled file (without dev mapping) and a minified version in the `dist` folder. Note that this will not work in Windows CMD or PowerShell (due to the use of &&), but you can run it using the [Windows 10 bash shell](https://docs.microsoft.com/en-us/windows/wsl/install-win10).