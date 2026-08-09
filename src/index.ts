import createEditor from "arquill/EditorFactory";
import { FoldingAnnotation } from "orion/editor/annotations";
import type { FoldingAnchors } from "orion/editor/annotations";
import "orion/editor/themes/default.css";

export type { EditorOptions, InlayHint, InlayHintProvider, IEditor, InlayHintStyle } from "arquill/EditorFactory";
export type { FoldingAnchors } from "orion/editor/annotations";

/**
 * Hands over the markup the folding ruler draws its anchors with. The editor ships no icons - the host owns
 * them, and passing markup rather than a url lets it put a live element there, one which can follow a theme
 * change on its own.
 */
function setFoldingAnchors(anchors: FoldingAnchors | null): void {
    FoldingAnnotation.anchors = anchors;
}

declare global {
    interface Window {
        arquillEditor: {
            createEditor: typeof createEditor;
            setFoldingAnchors: typeof setFoldingAnchors;
        };
    }
}

(function() {
    window.arquillEditor = {
        createEditor: createEditor,
        setFoldingAnchors: setFoldingAnchors,
    };
})();
