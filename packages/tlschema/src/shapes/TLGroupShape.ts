import { RecordProps, createRecordPropsMigrations } from '../propsMigrations'
import { TLBaseShape } from './TLBaseShape'

/** @public */
export type TLGroupShapeProps = { [key in never]: undefined }

/** @public */
export type TLGroupShape = TLBaseShape<'group', TLGroupShapeProps>

/** @internal */
export const groupShapeProps: RecordProps<TLGroupShape> = {}

/** @internal */
export const groupShapeMigrations = createRecordPropsMigrations({ sequence: [] })
