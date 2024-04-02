import { createMigrationIds, createMigrations } from '@tldraw/store'
import { objectMapEntries } from '@tldraw/utils'
import { TLArrowBinding } from './bindings/TLArrowBinding'
import { VecModel } from './misc/geometry-types'
import { createBindingId } from './records/TLBinding'
import { TLShape, TLShapeId } from './records/TLShape'

const Versions = createMigrationIds('com.tldraw.store', {
	RemoveCodeAndIconShapeTypes: 1,
	AddInstancePresenceType: 2,
	RemoveTLUserAndPresenceAndAddPointer: 3,
	RemoveUserDocument: 4,
	ExtractArrowBindings: 5,
} as const)

export { Versions as storeVersions }

/** @public */
export const storeMigrations = createMigrations({
	sequenceId: 'com.tldraw.store',
	retroactive: false,
	sequence: [
		{
			id: Versions.RemoveCodeAndIconShapeTypes,
			scope: 'store',
			up: (store) => {
				for (const [id, record] of objectMapEntries(store)) {
					if (
						record.typeName === 'shape' &&
						((record as TLShape).type === 'icon' || (record as TLShape).type === 'code')
					) {
						delete store[id]
					}
				}
			},
		},
		{
			id: Versions.AddInstancePresenceType,
			scope: 'store',
			up(_store) {
				// noop
				// there used to be a down migration for this but we made down migrations optional
				// and we don't use them on store-level migrations so we can just remove it
			},
		},
		{
			// remove user and presence records and add pointer records
			id: Versions.RemoveTLUserAndPresenceAndAddPointer,
			scope: 'store',
			up: (store) => {
				for (const [id, record] of objectMapEntries(store)) {
					if (record.typeName.match(/^(user|user_presence)$/)) {
						delete store[id]
					}
				}
			},
		},
		{
			// remove user document records
			id: Versions.RemoveUserDocument,
			scope: 'store',
			up: (store) => {
				for (const [id, record] of objectMapEntries(store)) {
					if (record.typeName.match('user_document')) {
						delete store[id]
					}
				}
			},
		},
		{
			id: Versions.ExtractArrowBindings,
			scope: 'store',
			dependsOn: ['com.tldraw.shape.arrow/3'],
			up: (store) => {
				type OldArrowTerminal =
					| {
							type: 'point'
							x: number
							y: number
					  }
					| {
							type: 'binding'
							boundShapeId: TLShapeId
							normalizedAnchor: VecModel
							isExact: boolean
							isPrecise: boolean
					  }

				const arrows: any[] = Object.values(store).filter(
					(r: any) => r.typeName === 'shape' && r.type === 'arrow'
				)

				const bindings: TLArrowBinding[] = []
				for (const arrow of arrows) {
					const { start, end } = (
						arrow as { props: { start: OldArrowTerminal; end: OldArrowTerminal } }
					).props

					if (start.type === 'binding') {
						bindings.push({
							id: createBindingId(),
							typeName: 'binding',
							type: 'arrow',
							fromId: arrow.id,
							toId: start.boundShapeId,
							meta: {},
							props: {
								terminal: 'start',
								normalizedAnchor: start.normalizedAnchor,
								isExact: start.isExact,
								isPrecise: start.isPrecise,
							},
						})
						arrow.props.start = { x: 0, y: 0 }
					} else {
						arrow.props.start = { x: start.x, y: start.y }
					}

					if (end.type === 'binding') {
						bindings.push({
							id: createBindingId(),
							typeName: 'binding',
							type: 'arrow',
							fromId: arrow.id,
							toId: end.boundShapeId,
							meta: {},
							props: {
								terminal: 'end',
								normalizedAnchor: end.normalizedAnchor,
								isExact: end.isExact,
								isPrecise: end.isPrecise,
							},
						})
						arrow.props.end = { x: 0, y: 0 }
					} else {
						arrow.props.end = { x: end.x, y: end.y }
					}
				}

				for (const binding of bindings) {
					store[binding.id] = binding
				}
			},
		},
	],
})
