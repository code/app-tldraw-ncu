import {
	Migration,
	MigrationId,
	Migrations,
	StandaloneDependsOn,
	UnknownRecord,
	createMigrations,
} from '@tldraw/store'
import { Expand } from '@tldraw/utils'
import { T } from '@tldraw/validate'
import { SchemaWithPropsInfo } from './createTLSchema'

export const NO_DOWN_MIGRATION = 'none' as const
/**
 * If a down migration was deployed more than a couple of months ago it should be safe to retire it.
 * We only really need them to smooth over the transition between versions, and some folks do keep
 * browser tabs open for months without refreshing, but at a certain point that kind of behavior is
 * on them. Plus anyway recently chrome has started to actually kill tabs that are open for too long
 * rather than just suspending them, so if other browsers follow suit maybe it's less of a concern.
 */
export const RETIRED_DOWN_MIGRATION = 'retired' as const

/**
 * @public
 */
export type TLRecordPropsMigrations = {
	sequence: Array<
		| StandaloneDependsOn
		| {
				readonly version: number
				readonly dependsOn?: readonly MigrationId[]
				readonly up: (props: any) => any
				readonly down:
					| typeof NO_DOWN_MIGRATION
					| typeof RETIRED_DOWN_MIGRATION
					| ((props: any) => any)
		  }
	>
}

/** @public */
export type RecordProps<Record extends { props: object } & UnknownRecord> = {
	[K in keyof Record['props']]: T.Validatable<Record['props'][K]>
}

/** @public */
export type RecordPropsType<Config extends Record<string, T.Validatable<any>>> = Expand<{
	[K in keyof Config]: T.TypeOf<Config[K]>
}>

/** @public */
export function createRecordPropsMigrations(
	migrations: TLRecordPropsMigrations
): TLRecordPropsMigrations {
	return migrations
}

export function processRecordPropsMigrations<T extends { type: string } & UnknownRecord>(
	recordType: T['typeName'],
	subTypes: Record<string, SchemaWithPropsInfo>
) {
	const result: Migrations[] = []

	for (const [subType, { migrations }] of Object.entries(subTypes)) {
		const sequenceId = `com.tldraw.${recordType}.${subType}`
		if (!migrations) {
			// provide empty migrations sequence to allow for future migrations
			result.push(
				createMigrations({
					sequenceId,
					retroactive: false,
					sequence: [],
				})
			)
		} else if ('sequence' in migrations) {
			result.push(
				createMigrations({
					sequenceId,
					retroactive: false,
					sequence: migrations.sequence.map((m): Migration | StandaloneDependsOn =>
						'version' in m
							? {
									id: `${sequenceId}/${m.version}`,
									scope: 'record',
									filter: (r) => r.typeName === recordType && (r as T).type === subType,
									dependsOn: m.dependsOn,
									up: (record: any) => {
										const result = m.up(record.props)
										if (result) {
											record.props = result
										}
									},
									down:
										typeof m.down === 'function'
											? (record: any) => {
													const result = (m.down as (props: any) => any)(record.props)
													if (result) {
														record.props = result
													}
												}
											: undefined,
								}
							: m
					),
				})
			)
		} else {
			// legacy migrations, will be removed in the future
			result.push(
				createMigrations({
					sequenceId,
					retroactive: false,
					sequence: Object.keys(migrations.migrators)
						.map((k) => Number(k))
						.sort((a: number, b: number) => a - b)
						.map(
							(version): Migration => ({
								id: `${sequenceId}/${version}`,
								scope: 'record',
								filter: (r) => r.typeName === recordType && (r as T).type === subType,
								up: (record: any) => {
									const result = migrations.migrators[version].up(record)
									if (result) {
										return result
									}
								},
								down: (record: any) => {
									const result = migrations.migrators[version].down(record)
									if (result) {
										return result
									}
								},
							})
						),
				})
			)
		}
	}

	return result
}
