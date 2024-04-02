import {
	RecordId,
	UnknownRecord,
	createMigrationIds,
	createRecordMigrations,
	createRecordType,
} from '@tldraw/store'
import { mapObjectMapValues, noop } from '@tldraw/utils'
import { T } from '@tldraw/validate'
import { nanoid } from 'nanoid'
import { TLArrowBinding } from '../bindings/TLArrowBinding'
import { TLBaseBinding, createBindingValidator } from '../bindings/TLBaseBinding'
import { SchemaWithPropsInfo } from '../createTLSchema'

/**
 * The default set of bindings that are available in the editor.
 *
 * @public */
export type TLDefaultBinding = TLArrowBinding

/**
 * A type for a binding that is available in the editor but whose type is
 * unknown—either one of the editor's default bindings or else a custom binding.
 *
 * @public
 */
export type TLUnknownBinding = TLBaseBinding<string, object>

/** @public */
export type TLBinding = TLDefaultBinding | TLUnknownBinding

/** @public */
export type TLBindingPartial<T extends TLBinding = TLBinding> = T extends T
	? {
			id: TLBindingId
			type: T['type']
			props?: Partial<T['props']>
			meta?: Partial<T['meta']>
		} & Partial<Omit<T, 'type' | 'id' | 'props' | 'meta'>>
	: never

/** @public */
export type TLBindingId = RecordId<TLUnknownBinding>

/** @public */
export function isBinding(record?: UnknownRecord): record is TLBinding {
	if (!record) return false
	return record.typeName === 'shape'
}

/** @public */
export function isBindingId(id?: string): id is TLBindingId {
	if (!id) return false
	return id.startsWith('binding:')
}

/** @public */
export function createBindingId(id?: string): TLBindingId {
	return `binding:${id ?? nanoid()}` as TLBindingId
}

const Versions = createMigrationIds('com.tldraw.binding', {
	ExtractArrowBindings: 1,
} as const)

/** @internal */
export const rootBindingMigrations = createRecordMigrations({
	sequenceId: 'com.tldraw.binding',
	recordType: 'binding',
	sequence: [
		{
			id: Versions.ExtractArrowBindings,
			dependsOn: ['com.tldraw.store/5'],
			up: noop,
			down: noop,
		},
	],
})

/** @internal */
export function createBindingRecordType(bindings: Record<string, SchemaWithPropsInfo>) {
	return createRecordType<TLBinding>('binding', {
		scope: 'document',
		validator: T.model(
			'binding',
			T.union(
				'type',
				mapObjectMapValues(bindings, (type, { props, meta }) =>
					createBindingValidator(type, props, meta)
				)
			)
		),
	}).withDefaultProperties(() => ({ meta: {} }))
}
