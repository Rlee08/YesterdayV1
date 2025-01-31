import { createContext, useCallback, useState, useContext, useEffect } from 'react'
import { Editor, Tldraw, useEditor } from 'tldraw'
import { useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import './index.css'
import { getBookmarkPreview } from './getBookmarkPreview'
import { multiplayerAssetStore } from './multiplayerAssetStore'
import { CustomRenderer } from './CustomRenderer'

// Where is our worker located? Configure this in `vite.config.ts`
const WORKER_URL = process.env.TLDRAW_WORKER_URL

// In this example, the room ID is hard-coded. You can set this however you like though.
// const roomId = 'test-room2'

const focusedEditorContext = createContext(
	{} as {
		focusedEditor: Editor | null
		setFocusedEditor(id: Editor | null): void
	}
)

export default function Master() {
	const [focusedEditor, _setFocusedEditor] = useState<Editor | null>(null)

	const setFocusedEditor = useCallback(
		(editor: Editor | null) => {
			if (focusedEditor !== editor) {
				if (focusedEditor) {
					focusedEditor.blur()
				}
				if (editor) {
					editor.focus()
				}
				_setFocusedEditor(editor)
			}
		},
		[focusedEditor]
	)

	return (
		<div className="display-backdrop">
			<focusedEditorContext.Provider value={{ focusedEditor, setFocusedEditor }}>
      {/* <h1>Focusing: {focusName}</h1> */}
				<div className="masters-grid">
					<Editor0 />
					<Editor1 />
				</div>
			</focusedEditorContext.Provider>
		</div>
	)
}

function Editor0() {
	const { setFocusedEditor } = useContext(focusedEditorContext)

	return (
		<div>
			<div
				tabIndex={-1}
				onPointerEnter={() => setFocusedEditor((window as any).EDITOR_C)}
				// onPointerLeave={() => setFocusedEditor(null)}
				style={{ height: '90vh', width: '100%',}}
			>
				<Tldraw
          hideUi
          className="editor"
					autoFocus={false}
					onMount={(editor) => {
						;(window as any).EDITOR_C = editor
					}}
				/>
			</div>
      <h1>Day 0</h1>
		</div>
	)
}

function Editor1() {
	const { setFocusedEditor } = useContext(focusedEditorContext)

  // Create a store connected to multiplayer.
  const store = useSync({
    uri: `${WORKER_URL}/connect/test-room2`,
    assets: multiplayerAssetStore,
  })

  const CustomUi = () => {
    const editor = useEditor()

    useEffect(() => {
        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Delete':
                case 'Backspace': {
                    editor.deleteShapes(editor.getSelectedShapeIds())
                    break
                }
                case 'v': {
                    editor.setCurrentTool('select')
                    break
                }
                case 'e': {
                    editor.setCurrentTool('eraser')
                    break
                }
                case 'x':
                case 'p':
                case 'b':
                case 'd': {
                    editor.setCurrentTool('draw')
                    break
                }
            }
        }

        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [editor])

    return null // or return any UI elements you want to add
  }

	return (
		<div>
			<div
				tabIndex={-1}
				onPointerEnter={() => setFocusedEditor((window as any).EDITOR_B)}
				onPointerLeave={() => setFocusedEditor(null)}
				style={{ height: '90vh', width: '100%',}}
			>
				<Tldraw
          hideUi
          store={store}
          onMount={(editor) => {
            ;(window as any).EDITOR_B = editor
            editor.registerExternalAssetHandler('url', getBookmarkPreview)
          }}
          components={{
            Background: CustomRenderer,
          }}
          autoFocus={false}
          className="editor"
				>
			<CustomUi />
			</Tldraw>
			</div>
      <div>
        <h1>Day 1</h1>
        </div>
		</div>
	)


}

/* 
This example shows how to use multiple editors on the same page. When doing this, you'll
need to make sure that only one editor is focused at a time. We can manage this using 
the autofocus prop on the tldraw component, along with React's context and set state 
APIs.

[1]
We first create a context that will hold the focused editor id and a setter for that id. 
We'll use this to keep track of which editor is focused.

[2]
Wrap the editors in the context provider. This will make the context available to all
of the editors.

[3]	
Get the focused editor id and the setter from the context. We'll use these to determine
if the editor should be focused or not. We wrap the Tldraw component in a div and use 
the onFocus event to set the focused editor id. 

[4]
Same again, but we're using the same persistence key for editors B and C. This means
that they will share a document. 
*/