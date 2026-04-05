/** Inline CSS properties applied to an inlay hint span. */
export interface InlayHintStyle {
    color?: string;
    backgroundColor?: string;
    borderRadius?: string;
    padding?: string;
    marginLeft?: string;
    marginRight?: string;
    fontSize?: string;
    verticalAlign?: string;
    [key: string]: string | undefined;
}

/** A single inlay hint to render at a document offset. */
export interface InlayHint {
    /** Absolute document offset at which the hint is inserted. */
    offset: number;
    /** Plain text, raw HTML object, or a DOM node. */
    content: string | { html: string } | Node;
    /** Inline CSS properties applied to the hint span. */
    style?: InlayHintStyle;
    /** Extra CSS class(es) for the hint span. */
    styleClass?: string;
}

/** Provides inlay hints for each line of the document. */
export interface InlayHintProvider {
    computeInlays(lineText: string, lineIndex: number, lineStart: number): InlayHint[] | null | undefined;
}

/** Options passed to {@link createEditor}. */
export interface EditorOptions {
    parent?: string | HTMLElement;
    document?: Document;
    contents?: string;
    title?: string;
    readonly?: boolean;
    tabSize?: number;
    expandTab?: boolean;
    wrapMode?: boolean;
    wrappable?: boolean;
    singleMode?: boolean;
    tabMode?: boolean;
    fullSelection?: boolean;
    themeClass?: string;
    theme?: string | object;
    showLinesRuler?: boolean;
    showAnnotationRuler?: boolean;
    showOverviewRuler?: boolean;
    showZoomRuler?: boolean;
    showFoldingRuler?: boolean;
    showWhitespaces?: boolean;
    firstLineIndex?: number;
    noFocus?: boolean;
    noComputeSize?: boolean;
    autoPairParentheses?: boolean;
    autoPairBraces?: boolean;
    autoPairSquareBrackets?: boolean;
    autoPairAngleBrackets?: boolean;
    autoPairQuotations?: boolean;
    autoCompleteComments?: boolean;
    smartIndentation?: boolean;
    statusReporter?: (message: string, isError?: boolean) => void;
    hoverFactory?: object;
    model?: object;
    className?: string;
}

/** Public interface for the editor instance returned by {@link createEditor}. */
export interface IEditor {
    getTextView(): any;
    getModel(): any;
    addEventListener(type: string, listener: (e: any) => void): void;
    setInput(title: string | null, message: string | null, contents: string, contentsSaved?: boolean, noFocus?: boolean): void;
    setWhitespacesVisible(visible: boolean): void;
    isWhitespacesVisible(): boolean;
    setInlayHintProvider(provider: InlayHintProvider | null): void;
    getInlayHintProvider(): InlayHintProvider | null;
}
