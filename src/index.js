import createEditor from 'arquill/editor/EditorFactory'
import * as mEditor from "orion/editor/editor";
import 'orion/editor/themes/default.css';

(function() {
	window.arquillEditor = {
		createEditor : createEditor
	}
})()