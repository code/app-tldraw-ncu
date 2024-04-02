import { T } from '@tldraw/validate'
import { RecordPropsType, createRecordPropsMigrations } from '../propsMigrations'
import { TLBaseShape } from './TLBaseShape'

/** @public */
export const frameShapeProps = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	name: T.string,
}

type TLFrameShapeProps = RecordPropsType<typeof frameShapeProps>

/** @public */
export type TLFrameShape = TLBaseShape<'frame', TLFrameShapeProps>

/** @internal */
export const frameShapeMigrations = createRecordPropsMigrations({
	sequence: [],
})
