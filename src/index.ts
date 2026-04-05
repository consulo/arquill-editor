import createEditor from "arquill/editor/EditorFactory";
import "orion/editor/themes/default.css";

export type { EditorOptions, InlayHint, InlayHintProvider, IEditor, InlayHintStyle } from "arquill/editor/EditorFactory";

declare global {
    interface Window {
        arquillEditor: {
            createEditor: typeof createEditor;
        };
    }
}

(function() {
    window.arquillEditor = {
        createEditor: createEditor,
    };
})();
