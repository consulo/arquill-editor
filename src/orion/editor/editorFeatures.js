/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser*/
import * as mFactories from './factories'; //$NON-NLS-0$
import * as mActions from './actions'; //$NON-NLS-0$
import * as mLinkedMode from './linkedMode'; //$NON-NLS-0$
import * as objects from '../objects'; //$NON-NLS-0$

var _mixed = objects.mixin({}, mFactories, mActions, mLinkedMode);
export default _mixed;
export var KeyBindingsFactory = _mixed.KeyBindingsFactory;
export var UndoFactory = _mixed.UndoFactory;
export var LineNumberRulerFactory = _mixed.LineNumberRulerFactory;
export var FoldingRulerFactory = _mixed.FoldingRulerFactory;
export var ZoomRulerFactory = _mixed.ZoomRulerFactory;
export var AnnotationFactory = _mixed.AnnotationFactory;
export var TextDNDFactory = _mixed.TextDNDFactory;
export var LinkedMode = _mixed.LinkedMode;
