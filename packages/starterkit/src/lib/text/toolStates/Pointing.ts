import { StateNode, TLEventHandlers } from '@tldraw/editor'
import { TLTextShape, createShapeId } from '@tldraw/tlschema'

export class Pointing extends StateNode {
	static override id = 'pointing'

	shape?: TLTextShape

	override onExit = () => {
		this.editor.setHintingIds([])
	}

	override onPointerMove: TLEventHandlers['onPointerMove'] = (info) => {
		if (this.editor.inputs.isDragging) {
			const {
				inputs: { originPagePoint },
			} = this.editor

			const id = createShapeId()

			this.editor.mark('creating')

			this.editor.createShapes<TLTextShape>([
				{
					id,
					type: 'text',
					x: originPagePoint.x,
					y: originPagePoint.y,
					props: {
						text: '',
						autoSize: false,
						w: 20,
					},
				},
			])

			this.editor.select(id)

			this.shape = this.editor.getShapeById(id)
			if (!this.shape) return

			this.editor.setSelectedTool('select.resizing', {
				...info,
				target: 'selection',
				handle: 'right',
				isCreating: true,
				creationCursorOffset: { x: 1, y: 1 },
				editAfterComplete: true,
				onInteractionEnd: 'text',
			})
		}
	}

	override onPointerUp = () => {
		this.complete()
	}

	override onComplete = () => {
		this.cancel()
	}
	override onCancel = () => {
		this.cancel()
	}

	override onInterrupt = () => {
		this.cancel()
	}

	complete() {
		this.editor.mark('creating text shape')
		const id = createShapeId()
		const { x, y } = this.editor.inputs.currentPagePoint
		this.editor.createShapes(
			[
				{
					id,
					type: 'text',
					x,
					y,
					props: {
						text: '',
						autoSize: true,
					},
				},
			],
			true
		)

		this.editor.setEditingId(id)
		this.editor.setSelectedTool('select')
		this.editor.root.current.value?.transition('editing_shape', {})
	}

	cancel() {
		this.parent.transition('idle', {})
		this.editor.bailToMark('creating')
	}
}