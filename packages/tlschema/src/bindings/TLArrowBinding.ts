import { noop } from '@tldraw/utils'
import { T } from '@tldraw/validate'
import { VecModel, vecModelValidator } from '../misc/geometry-types'
import { RecordProps, createRecordPropsMigrations } from '../propsMigrations'
import { storeVersions } from '../store-migrations'
import { TLBaseBinding } from './TLBaseBinding'

/** @public */
export interface TLArrowBindingProps {
	terminal: 'start' | 'end'
	normalizedAnchor: VecModel
	/**
	 * exact is whether the arrow head 'enters' the bound shape to point directly at the binding
	 * anchor point
	 */
	isExact: boolean
	/**
	 * precise is whether to bind to the normalizedAnchor, or to the middle of the shape
	 */
	isPrecise: boolean
}

/** @public */
export const arrowBindingProps: RecordProps<TLArrowBinding> = {
	terminal: T.literalEnum('start', 'end'),
	normalizedAnchor: vecModelValidator,
	isExact: T.boolean,
	isPrecise: T.boolean,
}

/** @public */
export type TLArrowBinding = TLBaseBinding<'arrow', TLArrowBindingProps>

export const arrowBindingVersions = {
	ExtractBinding: 1,
} as const

/** @internal */
export const arrowBindingMigrations = createRecordPropsMigrations({
	sequence: [
		{
			version: arrowBindingVersions.ExtractBinding,
			dependsOn: [storeVersions.ExtractArrowBindings],
			up: noop,
			down: noop,
		},
	],
})
