declare module "orion/editor/textView" {
    export class TextView {
        constructor(options: any);
        addEventListener(type: string, listener: (e: any) => void): void;
        redraw(): void;
        computeSize(): { width: number; height: number };
    }
}

declare module "orion/editor/textModel" {
    export class TextModel {
        constructor(text?: string);
    }
}

declare module "orion/editor/textTheme" {
    export namespace TextTheme {
        function getTheme(name: string): any;
    }
}

declare module "orion/editor/projectionTextModel" {
    export class ProjectionTextModel {
        constructor(model: any);
    }
}

declare module "orion/editor/editor" {
    export class Editor {
        constructor(options: any);
        addEventListener(type: string, listener: (e: any) => void): void;
        installTextView(): void;
        getTextView(): any;
        getModel(): any;
        getLineNumberRuler(): any;
        getSourceCodeActions(): any;
        setLineNumberRulerVisible(visible: boolean): void;
        setAnnotationRulerVisible(visible: boolean): void;
        setOverviewRulerVisible(visible: boolean): void;
        setZoomRulerVisible(visible: boolean): void;
        setFoldingRulerVisible(visible: boolean): void;
        setInput(title: string | null, message: string | null, contents: string, contentsSaved?: boolean, noFocus?: boolean): void;
    }
}

declare module "orion/editor/editorFeatures" {
    export class UndoFactory { constructor(); }
    export class AnnotationFactory { constructor(); }
    export class LineNumberRulerFactory { constructor(); }
    export class FoldingRulerFactory { constructor(); }
    export class TextDNDFactory { constructor(); }
    export class KeyBindingsFactory { constructor(); }
}

declare module "orion/editor/contentAssist" {
    export class ContentAssist {
        constructor(textView: any);
        setMode(mode: any): void;
        setProviders(providers: any[]): void;
    }
    export class ContentAssistWidget {
        constructor(contentAssist: any);
    }
    export class ContentAssistMode {
        constructor(contentAssist: any, widget: any);
    }
}

declare module "orion/editor/textStyler" {}
