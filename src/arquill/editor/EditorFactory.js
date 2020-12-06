import * as mTextView from "orion/editor/textView";
import * as mTextModel from "orion/editor/textModel"
import * as mTextTheme from "orion/editor/textTheme";
import * as mProjModel from "orion/editor/projectionTextModel";
import * as mEditor from "orion/editor/editor";
import * as mEditorFeatures from "orion/editor/editorFeatures";
import * as mContentAssist from "orion/editor/contentAssist";
import * as mTextStyler from "orion/editor/textStyler";

/**    @private */
function getDisplay(window, document, element)
{
	var display;
	var temp = element;
	while(temp && temp !== document && display !== "none")
	{ //$NON-NLS-0$
		if(window.getComputedStyle)
		{
			var style = window.getComputedStyle(temp, null);
			display = style.getPropertyValue("display"); //$NON-NLS-0$
		}
		else
		{
			display = temp.currentStyle.display;
		}
		temp = temp.parentNode;
	}
	if(!temp || !display)
	{
		return "none"; //$NON-NLS-0$
	}
	return display;
}

/**    @private */
function getTextFromElement(element)
{
	var firstChild = element.firstChild;
	if(firstChild && firstChild.tagName === "TEXTAREA")
	{ //$NON-NLS-0$
		return firstChild.value;
	}
	var document = element.ownerDocument;
	var window = document.defaultView || document.parentWindow;
	if(!window.getSelection || (element.childNodes.length === 1 && firstChild.nodeType === Node.TEXT_NODE) || getDisplay(window, document, element) === "none") //$NON-NLS-0$
	{
		return element.innerText || element.textContent;
	}
	var newRange = document.createRange();
	newRange.selectNode(element);
	var selection = window.getSelection();
	var oldRanges = [], i;
	for(i = 0; i < selection.rangeCount; i++)
	{
		oldRanges.push(selection.getRangeAt(i));
	}
	selection.removeAllRanges();
	selection.addRange(newRange);
	var text = selection.toString();
	selection.removeAllRanges();
	for(i = 0; i < oldRanges.length; i++)
	{
		selection.addRange(oldRanges[i]);
	}
	return text;
}

/**    @private */
function optionName(name)
{
	var prefix = "data-editor-"; //$NON-NLS-0$
	if(name.substring(0, prefix.length) === prefix)
	{
		var key = name.substring(prefix.length);
		key = key.replace(/-([a-z])/ig, /* @callback */ function(all, character)
		{
			return character.toUpperCase();
		});
		return key;
	}
	return undefined;
}

/**    @private */
function merge(obj1, obj2)
{
	for(var p in obj2)
	{
		if(obj2.hasOwnProperty(p))
		{
			obj1[p] = obj2[p];
		}
	}
}

/**    @private */
function getHeight(node)
{
	return node.clientHeight;
}

/**    @private */
function mergeOptions(parent, defaultOptions)
{
	var options = {};
	merge(options, defaultOptions);
	for(var attr, j = 0, attrs = parent.attributes, l = attrs.length; j < l; j++)
	{
		attr = attrs.item(j);
		var key = optionName(attr.nodeName);
		if(key)
		{
			var value = attr.nodeValue;
			if(value === "true" || value === "false")
			{ //$NON-NLS-1$ //$NON-NLS-0$
				value = value === "true"; //$NON-NLS-0$
			}
			options[key] = value;
		}
	}
	return options;
}

export default function createEditor(options)
{
	var doc = options.document || document;
	var parent = options.parent;
	if(!parent)
	{
		parent = "editor";
	} //$NON-NLS-0$
	if(typeof(parent) === "string")
	{ //$NON-NLS-0$
		parent = doc.getElementById(parent);
	}
	if(!parent)
	{
		if(options.className)
		{
			var parents = getParents(doc, options.className);
			if(parents)
			{
				options.className = undefined;
				// Do not focus editors by default when creating multiple editors
				if(parents.length > 1 && options.noFocus === undefined)
				{
					options.noFocus = true;
				}
				var editors = [];
				for(var i = parents.length - 1; i >= 0; i--)
				{
					options.parent = parents[i];
					editors.push(edit(options));
				}
				return editors;
			}
		}
	}
	if(!parent)
	{
		throw new Error("no parent");
	} //$NON-NLS-0$
	options = mergeOptions(parent, options);

	if(typeof options.theme === "string")
	{ //$NON-NLS-0$
		var theme = mTextTheme.TextTheme.getTheme(options.theme);
		var index = options.theme.lastIndexOf("/"); //$NON-NLS-0$
		var themeClass = options.theme;
		if(index !== -1)
		{
			themeClass = themeClass.substring(index + 1);
		}
		var extension = ".css"; //$NON-NLS-0$
		if(themeClass.substring(themeClass.length - extension.length) === extension)
		{
			themeClass = themeClass.substring(0, themeClass.length - extension.length);
		}
		theme.setThemeClass(themeClass, {href: options.theme});
		options.theme = theme;
	}
	var textViewFactory = function()
	{
		return new mTextView.TextView({
			parent: parent,
			model: new mProjModel.ProjectionTextModel(options.model ? options.model : new mTextModel.TextModel("")),
			tabSize: options.tabSize ? options.tabSize : 4,
			readonly: options.readonly,
			fullSelection: options.fullSelection,
			tabMode: options.tabMode,
			expandTab: options.expandTab,
			singleMode: options.singleMode,
			themeClass: options.themeClass,
			theme: options.theme,
			wrapMode: options.wrapMode,
			wrappable: options.wrappable
		});
	};

	var contentAssist, contentAssistFactory;
	if(!options.readonly)
	{
		contentAssistFactory = {
			createContentAssistMode: function(editor)
			{
				contentAssist = new mContentAssist.ContentAssist(editor.getTextView());
				var contentAssistWidget = new mContentAssist.ContentAssistWidget(contentAssist);
				var result = new mContentAssist.ContentAssistMode(contentAssist, contentAssistWidget);
				contentAssist.setMode(result);
				return result;
			}
		};
	}

	var editor = new mEditor.Editor({
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
		domNode: parent
	});
	editor.addEventListener("TextViewInstalled", function()
	{ //$NON-NLS-0$
		var ruler = editor.getLineNumberRuler();
		if(ruler && options.firstLineIndex !== undefined)
		{
			ruler.setFirstLine(options.firstLineIndex);
		}
		var sourceCodeActions = editor.getSourceCodeActions();
		if(sourceCodeActions)
		{
			sourceCodeActions.setAutoPairParentheses(options.autoPairParentheses);
			sourceCodeActions.setAutoPairBraces(options.autoPairBraces);
			sourceCodeActions.setAutoPairSquareBrackets(options.autoPairSquareBrackets);
			sourceCodeActions.setAutoPairAngleBrackets(options.autoPairAngleBrackets);
			sourceCodeActions.setAutoPairQuotations(options.autoPairQuotations);
			sourceCodeActions.setAutoCompleteComments(options.autoCompleteComments);
			sourceCodeActions.setSmartIndentation(options.smartIndentation);
		}
	});

	var contents = options.contents;
	if(contents === undefined)
	{
		contents = getTextFromElement(parent);
	}

	if(!contents)
	{
		contents = "";
	}

	editor.installTextView();
	editor.setLineNumberRulerVisible(options.showLinesRuler === undefined || options.showLinesRuler);
	editor.setAnnotationRulerVisible(options.showAnnotationRuler === undefined || options.showFoldingRuler);
	editor.setOverviewRulerVisible(options.showOverviewRuler === undefined || options.showOverviewRuler);
	editor.setZoomRulerVisible(options.showZoomRuler === undefined || options.showZoomRuler);
	editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
	editor.setInput(options.title, null, contents, false, options.noFocus);

	/*
	 * The minimum height of the editor is 50px. Do not compute size if the editor is not
	 * attached to the DOM or it is display=none.
	 */
	var window = doc.defaultView || doc.parentWindow;
	if(!options.noComputeSize && getDisplay(window, doc, parent) !== "none" && getHeight(parent) <= 50)
	{ //$NON-NLS-0$
		var height = editor.getTextView().computeSize().height;
		parent.style.height = height + "px"; //$NON-NLS-0$
	}
	return editor;
}