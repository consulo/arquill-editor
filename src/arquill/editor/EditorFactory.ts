import * as mTextView from "orion/editor/textView";
import * as mTextModel from "orion/editor/textModel";
import * as mTextTheme from "orion/editor/textTheme";
import * as mProjModel from "orion/editor/projectionTextModel";
import * as mEditor from "orion/editor/editor";
import * as mEditorFeatures from "orion/editor/editorFeatures";
import * as mContentAssist from "orion/editor/contentAssist";
import * as mTextStyler from "orion/editor/textStyler";

import type { EditorOptions, InlayHint, InlayHintProvider, ContentAssistProvider, IEditor } from "./api";

export type { EditorOptions, InlayHint, InlayHintProvider, ContentAssistProvider, IEditor, InlayHintStyle, CompletionProposal } from "./api";

// ─── private helpers ─────────────────────────────────────────────────────────

function getDisplay(window: any, document: any, element: any): string {
    let display: string | undefined;
    let temp: any = element;
    while (temp && temp !== document && display !== "none") {
        if (window.getComputedStyle) {
            const style = window.getComputedStyle(temp, null);
            display = style.getPropertyValue("display");
        }
        else {
            display = temp.currentStyle.display;
        }
        temp = temp.parentNode;
    }
    if (!temp || !display) {
        return "none";
    }
    return display;
}

function getTextFromElement(element: HTMLElement): string {
    const firstChild = element.firstChild as any;
    if (firstChild && firstChild.tagName === "TEXTAREA") {
        return firstChild.value;
    }
    const doc = element.ownerDocument;
    const win = (doc as any).defaultView || (doc as any).parentWindow;
    if (!win.getSelection
        || (element.childNodes.length === 1 && firstChild.nodeType === Node.TEXT_NODE)
        || getDisplay(win, doc, element) === "none") {
        return (element as any).innerText || element.textContent || "";
    }
    const newRange = doc.createRange();
    newRange.selectNode(element);
    const selection = win.getSelection();
    const oldRanges: Range[] = [];
    for (let i = 0; i < selection.rangeCount; i++) {
        oldRanges.push(selection.getRangeAt(i));
    }
    selection.removeAllRanges();
    selection.addRange(newRange);
    const text = selection.toString();
    selection.removeAllRanges();
    for (let i = 0; i < oldRanges.length; i++) {
        selection.addRange(oldRanges[i]);
    }
    return text;
}

function optionName(name: string): string | undefined {
    const prefix = "data-editor-";
    if (name.substring(0, prefix.length) === prefix) {
        let key = name.substring(prefix.length);
        key = key.replace(/-([a-z])/ig, (_all: string, character: string) => character.toUpperCase());
        return key;
    }
    return undefined;
}

function merge(obj1: any, obj2: any): void {
    for (const p in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, p)) {
            obj1[p] = obj2[p];
        }
    }
}

function getHeight(node: HTMLElement): number {
    return node.clientHeight;
}

function mergeOptions(parent: HTMLElement, defaultOptions: EditorOptions): EditorOptions {
    const options: EditorOptions = {};
    merge(options, defaultOptions);
    const attrs = parent.attributes;
    for (let j = 0; j < attrs.length; j++) {
        const attr = attrs.item(j)!;
        const key = optionName(attr.nodeName);
        if (key) {
            let value: any = attr.nodeValue;
            if (value === "true" || value === "false") {
                value = value === "true";
            }
            (options as any)[key] = value;
        }
    }
    return options;
}

// ─── factory ─────────────────────────────────────────────────────────────────

export default function createEditor(options: EditorOptions): IEditor {
    const doc: any = (options as any).document || document;
    let parent: any = options.parent;
    if (!parent) {
        parent = "editor";
    }
    if (typeof parent === "string") {
        parent = doc.getElementById(parent);
    }
    if (!parent) {
        throw new Error("no parent");
    }
    options = mergeOptions(parent, options);

    if (typeof options.theme === "string") {
        const theme = mTextTheme.TextTheme.getTheme(options.theme);
        let themeClass = options.theme;
        const index = themeClass.lastIndexOf("/");
        if (index !== -1) {
            themeClass = themeClass.substring(index + 1);
        }
        const extension = ".css";
        if (themeClass.substring(themeClass.length - extension.length) === extension) {
            themeClass = themeClass.substring(0, themeClass.length - extension.length);
        }
        theme.setThemeClass(themeClass, { href: options.theme });
        (options as any).theme = theme;
    }

    const textViewFactory = () => new mTextView.TextView({
        parent: parent,
        model: new mProjModel.ProjectionTextModel(options.model ? options.model : new mTextModel.TextModel("")),
        tabSize: options.tabSize ? options.tabSize : 4,
        readonly: options.readonly,
        fullSelection: options.fullSelection,
        tabMode: options.tabMode,
        expandTab: options.expandTab,
        singleMode: options.singleMode,
        themeClass: options.themeClass,
        theme: (options as any).theme,
        wrapMode: options.wrapMode,
        wrappable: options.wrappable,
    });

    let contentAssist: any = null;
    let contentAssistFactory: any;
    if (!options.readonly) {
        contentAssistFactory = {
            createContentAssistMode(editor: any) {
                contentAssist = new mContentAssist.ContentAssist(editor.getTextView());
                const contentAssistWidget = new mContentAssist.ContentAssistWidget(contentAssist);
                const result = new mContentAssist.ContentAssistMode(contentAssist, contentAssistWidget);
                contentAssist.setMode(result);
                return result;
            }
        };
    }

    const orionEditor = new mEditor.Editor({
        textViewFactory: textViewFactory,
        undoStackFactory: new mEditorFeatures.UndoFactory(),
        annotationFactory: new mEditorFeatures.AnnotationFactory(),
        lineNumberRulerFactory: new mEditorFeatures.LineNumberRulerFactory(),
        foldingRulerFactory: new mEditorFeatures.FoldingRulerFactory(),
        textDNDFactory: new mEditorFeatures.TextDNDFactory(),
        contentAssistFactory: contentAssistFactory,
        keyBindingFactory: new mEditorFeatures.KeyBindingsFactory(),
        statusReporter: options.statusReporter,
        hoverFactory: options.hoverFactory,
        domNode: parent,
    });

    let _whitespacesVisible = !!options.showWhitespaces;
    const _spacePattern = { regex: /[ ]/g, styleClass: "punctuation separator space" };
    const _tabPattern   = { regex: /\t/g,  styleClass: "punctuation separator tab" };

    function _spliceWhitespace(ranges: any[], text: string, offset: number, pattern: { regex: RegExp; styleClass: string }): void {
        const regex = pattern.regex;
        regex.lastIndex = 0;
        let rangeIndex = 0;
        let result = regex.exec(text);
        while (result) {
            const charIndex = offset + result.index;
            while (rangeIndex < ranges.length && charIndex >= ranges[rangeIndex].end) {
                rangeIndex++;
            }
            const newStyle = { start: charIndex, end: charIndex + 1, style: { styleClass: pattern.styleClass, unmergeable: true } };
            if (rangeIndex < ranges.length && ranges[rangeIndex].start <= charIndex) {
                const tail = { start: charIndex + 1, end: ranges[rangeIndex].end, style: ranges[rangeIndex].style };
                ranges[rangeIndex].end = charIndex;
                ranges.splice(rangeIndex + 1, 0, tail);
                ranges.splice(rangeIndex + 1, 0, newStyle);
                rangeIndex += 2;
            }
            else {
                ranges.splice(rangeIndex, 0, newStyle);
                rangeIndex++;
            }
            result = regex.exec(text);
        }
    }

    function _onLineStyle(e: any): void {
        if (!e.ranges) { e.ranges = []; }
        if (_whitespacesVisible) {
            _spliceWhitespace(e.ranges, e.lineText, e.lineStart, _spacePattern);
            _spliceWhitespace(e.ranges, e.lineText, e.lineStart, _tabPattern);
        }
        if (_inlayHintProvider) {
            const model = orionEditor.getModel();
            const lineIndex = model.getLineAtOffset(e.lineStart);
            const hints = _inlayHintProvider.computeInlays(e.lineText, lineIndex, e.lineStart);
            if (hints) {
                for (let i = 0; i < hints.length; i++) {
                    const hint: InlayHint = hints[i];
                    const style: any = { unmergeable: true };
                    if (typeof hint.content === "string") {
                        /* Use html (not text) so _createSpan sets child.ignore=true,
                         * which prevents the cursor from entering the inlay span. */
                        style.html = hint.content
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;");
                    }
                    else if (hint.content && (hint.content as Node).nodeType) {
                        style.node = hint.content;
                    }
                    else if (typeof hint.content === "object" && (hint.content as { html: string }).html) {
                        style.html = (hint.content as { html: string }).html;
                    }
                    if (hint.style)      { style.style = hint.style; }
                    if (hint.styleClass) { style.styleClass = hint.styleClass; }
                    e.ranges.push({ start: hint.offset, end: hint.offset, style: style });
                }
            }
        }
    }

    let _inlayHintProvider: InlayHintProvider | null = null;

    orionEditor.addEventListener("TextViewInstalled", () => {
        const ruler = orionEditor.getLineNumberRuler();
        if (ruler && options.firstLineIndex !== undefined) {
            ruler.setFirstLine(options.firstLineIndex);
        }
        const sourceCodeActions = orionEditor.getSourceCodeActions();
        if (sourceCodeActions) {
            sourceCodeActions.setAutoPairParentheses(options.autoPairParentheses);
            sourceCodeActions.setAutoPairBraces(options.autoPairBraces);
            sourceCodeActions.setAutoPairSquareBrackets(options.autoPairSquareBrackets);
            sourceCodeActions.setAutoPairAngleBrackets(options.autoPairAngleBrackets);
            sourceCodeActions.setAutoPairQuotations(options.autoPairQuotations);
            sourceCodeActions.setAutoCompleteComments(options.autoCompleteComments);
            sourceCodeActions.setSmartIndentation(options.smartIndentation);
        }
        orionEditor.getTextView().addEventListener("LineStyle", _onLineStyle);
    });

    // Attach our public API methods onto the editor instance.
    const editor = orionEditor as unknown as IEditor;

    (editor as any).setWhitespacesVisible = function(visible: boolean): void {
        if (_whitespacesVisible === visible) { return; }
        _whitespacesVisible = visible;
        const tv = orionEditor.getTextView();
        if (tv) { tv.redraw(); }
    };

    (editor as any).isWhitespacesVisible = function(): boolean {
        return _whitespacesVisible;
    };

    (editor as any).setInlayHintProvider = function(provider: InlayHintProvider | null): void {
        _inlayHintProvider = provider;
        const tv = orionEditor.getTextView();
        if (tv) { tv.redraw(); }
    };

    (editor as any).getInlayHintProvider = function(): InlayHintProvider | null {
        return _inlayHintProvider;
    };

    (editor as any).setContentAssistProviders = function(providers: ContentAssistProvider[]): void {
        if (contentAssist) {
            contentAssist.setProviders(providers);
        }
    };

    let contents = options.contents;
    if (contents === undefined) {
        contents = getTextFromElement(parent);
    }
    if (!contents) {
        contents = "";
    }

    orionEditor.installTextView();
    orionEditor.setLineNumberRulerVisible(options.showLinesRuler === undefined || options.showLinesRuler);
    orionEditor.setAnnotationRulerVisible(options.showAnnotationRuler === undefined || options.showFoldingRuler);
    orionEditor.setOverviewRulerVisible(options.showOverviewRuler === undefined || options.showOverviewRuler);
    orionEditor.setZoomRulerVisible(options.showZoomRuler === undefined || options.showZoomRuler);
    orionEditor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
    orionEditor.setInput(options.title ?? null, null, contents, false, options.noFocus);

    const win = doc.defaultView || doc.parentWindow;
    if (!options.noComputeSize && getDisplay(win, doc, parent) !== "none" && getHeight(parent) <= 50) {
        const height = orionEditor.getTextView().computeSize().height;
        parent.style.height = height + "px";
    }

    return editor;
}
