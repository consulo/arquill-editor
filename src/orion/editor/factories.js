/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser*/
import * as mActions from './actions'; //$NON-NLS-0$
import * as mUndoStack from './undoStack'; //$NON-NLS-0$
import * as mRulers from './rulers'; //$NON-NLS-0$
import * as mAnnotations from './annotations'; //$NON-NLS-0$
import * as mTextDND from './textDND'; //$NON-NLS-0$
import * as mLinkedMode from './linkedMode'; //$NON-NLS-0$
import * as util from '../util'; //$NON-NLS-0$

class KeyBindingsFactory {
    createKeyBindings(editor, undoStack, contentAssist, searcher) {
        // Create keybindings for generic editing, no dependency on the service model
        var textActions = new mActions.TextActions(editor, undoStack , searcher);
        // Linked Mode
        var linkedMode = new mLinkedMode.LinkedMode(editor, undoStack, contentAssist);
        // create keybindings for source editing
        // TODO this should probably be something that happens more dynamically, when the editor changes input
        var sourceCodeActions = new mActions.SourceCodeActions(editor, undoStack, contentAssist, linkedMode);
        return {
            textActions: textActions,
            linkedMode: linkedMode,
            sourceCodeActions: sourceCodeActions
        };
    }
}

class UndoFactory {
    createUndoStack(editor) {
        var textView = editor.getTextView();
        return new mUndoStack.UndoStack(textView, 200);
    }
}

class LineNumberRulerFactory {
    createLineNumberRuler(annotationModel) {
        return new mRulers.LineNumberRuler(annotationModel, "left", {styleClass: "ruler lines"}, {styleClass: "rulerLines odd"}, {styleClass: "rulerLines even"}); //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
    }
}

class FoldingRulerFactory {
    createFoldingRuler(annotationModel) {
        return new mRulers.FoldingRuler(annotationModel, "left", {styleClass: "ruler folding"}); //$NON-NLS-1$ //$NON-NLS-0$
    }
}

class ZoomRulerFactory {
    createZoomRuler(annotationModel) {
        return new mRulers.ZoomRuler(util.isIOS || util.isAndroid ? "right" : "innerRight", {styleClass: "ruler zoom"}); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
    }
}

class AnnotationFactory {
    createAnnotationModel(model) {
        return new mAnnotations.AnnotationModel(model);
    }
    createAnnotationStyler(annotationModel, view) {
        return new mAnnotations.AnnotationStyler(annotationModel, view);
    }
    createAnnotationRulers(annotationModel) {
        var annotationRuler = new mRulers.AnnotationRuler(annotationModel, "left", {styleClass: "ruler annotations"}); //$NON-NLS-1$ //$NON-NLS-0$
        var overviewRuler = new mRulers.OverviewRuler(annotationModel, "right", {styleClass: "ruler overview"}); //$NON-NLS-1$ //$NON-NLS-0$
        var marksRuler = new mRulers.AnnotationRuler(annotationModel, "left", {styleClass: "ruler marks"}); //$NON-NLS-1$ //$NON-NLS-0$
        return {annotationRuler: annotationRuler, overviewRuler: overviewRuler, marksRuler: marksRuler};
    }
}

class TextDNDFactory {
    createTextDND(editor, undoStack) {
        return new mTextDND.TextDND(editor.getTextView(), undoStack);
    }
}

export { KeyBindingsFactory, UndoFactory, LineNumberRulerFactory, FoldingRulerFactory, ZoomRulerFactory, AnnotationFactory, TextDNDFactory };
