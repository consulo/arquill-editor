# arquill-editor

A web-based code editor widget built on the [Eclipse Orion](https://eclipse.org/orion/) text editor engine, packaged as a single JS + CSS bundle via webpack.

## Building

### Prerequisites

- Node.js (tested with v25)
- npm

### Install dependencies

```sh
npm install
```

### Build

```sh
npm run build
```

Output is written to `public/`:
- `public/arquillEditor.js`
- `public/arquillEditor.css`

### Dev server

```sh
npm run start:dev
```

Opens a live-reload server at `http://localhost:9000` serving the `public/` directory.

## Usage

Include the built files in your HTML page and call `arquillEditor.createEditor(options)`:

```html
<link rel="stylesheet" href="arquillEditor.css">
<script src="arquillEditor.js"></script>

<div id="editor"></div>

<script>
  var editor = arquillEditor.createEditor({
    parent: 'editor',
    contents: 'console.log("hello");',
    tabSize: 4,
    expandTab: false,
    showWhitespaces: false,
    autoPairParentheses: true,
    autoPairBraces: true,
    autoPairSquareBrackets: true,
    autoPairAngleBrackets: true,
    autoPairQuotations: true,
    autoCompleteComments: true,
    smartIndentation: true
  });
</script>
```

### All creation options

| Option | Type | Default | Description |
|---|---|---|---|
| `parent` | string \| Element | `"editor"` | Container element or its ID |
| `contents` | string | element text | Initial editor content |
| `readonly` | boolean | `false` | Prevent editing |
| `tabSize` | number | `4` | Width of a tab stop |
| `expandTab` | boolean | `false` | Insert spaces instead of a tab character |
| `tabMode` | boolean | `true` | Tab key consumed by editor (not focus traversal) |
| `wrapMode` | boolean | `false` | Wrap long lines |
| `wrappable` | boolean | `false` | Allow wrap mode to be toggled |
| `singleMode` | boolean | `false` | Single-line mode |
| `fullSelection` | boolean | `false` | Full-line selection highlight |
| `themeClass` | string | — | Extra CSS class on the editor root |
| `theme` | string \| TextTheme | — | Theme URL or `TextTheme` instance |
| `showLinesRuler` | boolean | `true` | Show line number gutter |
| `showAnnotationRuler` | boolean | `true` | Show annotation gutter (errors, breakpoints, …) |
| `showOverviewRuler` | boolean | `true` | Show overview ruler (right mini-map) |
| `showZoomRuler` | boolean | `true` | Show zoom ruler (mobile) |
| `showFoldingRuler` | boolean | `true` | Show folding gutter |
| `firstLineIndex` | number | `1` | First line number displayed |
| `showWhitespaces` | boolean | `false` | Render spaces as `·` and tabs as `→` |
| `autoPairParentheses` | boolean | — | Auto-close `()` |
| `autoPairBraces` | boolean | — | Auto-close `{}` |
| `autoPairSquareBrackets` | boolean | — | Auto-close `[]` |
| `autoPairAngleBrackets` | boolean | — | Auto-close `<>` |
| `autoPairQuotations` | boolean | — | Auto-close `"` and `'` |
| `autoCompleteComments` | boolean | — | Continue `/* */` block comments on Enter |
| `smartIndentation` | boolean | — | Match previous line indentation on Enter |
| `noFocus` | boolean | `false` | Do not focus the editor on creation |
| `noComputeSize` | boolean | `false` | Skip auto-height computation |
| `statusReporter` | function | — | `fn(message, type)` called for status updates |
| `hoverFactory` | object | — | Pluggable hover/tooltip provider |

### Runtime API

```js
// Content
editor.getText()
editor.setText(text)

// Whitespace rendering
editor.setWhitespacesVisible(true)
editor.isWhitespacesVisible()

// Rulers
editor.setLineNumberRulerVisible(bool)
editor.setFoldingRulerVisible(bool)
editor.setOverviewRulerVisible(bool)
editor.setAnnotationRulerVisible(bool)

// Undo state
editor.isDirty()
editor.markClean()

// Content assist — register a provider
var contentAssist = editor.getContentAssist();
contentAssist.addEventListener('Activating', function() {
  contentAssist.setProviders([myProvider]);
});
```

### Inlay hint provider

```js
editor.setInlayHintProvider({
  computeInlays: function(lineText, lineIndex, lineStart) {
    // Return an array of hints for this line, or null/[]
    return [
      {
        offset:     lineStart + 10,          // absolute document offset to insert before
        content:    ": string",              // string, {html: "<b>…</b>"}, or DOM Node
        style:      { color: "gray", fontStyle: "italic" },  // optional CSS properties
        styleClass: "my-inlay-hint"          // optional CSS class
      }
    ];
  }
});

// Remove provider
editor.setInlayHintProvider(null);
```

### Content assist provider interface

```js
var myProvider = {
  computeProposals: function(buffer, offset, context) {
    // context.prefix  — word before the cursor
    // context.line    — full line text
    // context.selection — {start, end}
    return [
      { proposal: 'completionSuffix', description: 'Full word shown in list' }
    ];
  }
};
```

## Demo

Open `public/index.html` in a browser (or serve `public/` with any static server).
The demo page has a toolbar that lets you toggle every editor option at runtime, plus a keyboard shortcuts reference panel.
