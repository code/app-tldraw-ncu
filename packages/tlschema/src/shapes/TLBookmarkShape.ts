import { T } from '@tldraw/validate'
import { assetIdValidator } from '../assets/TLBaseAsset'
import {
	RETIRED_DOWN_MIGRATION,
	RecordPropsType,
	createRecordPropsMigrations,
} from '../propsMigrations'
import { TLBaseShape } from './TLBaseShape'

/** @public */
export const bookmarkShapeProps = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	assetId: assetIdValidator.nullable(),
	url: T.linkUrl,
}

/** @public */
export type TLBookmarkShapeProps = RecordPropsType<typeof bookmarkShapeProps>

/** @public */
export type TLBookmarkShape = TLBaseShape<'bookmark', TLBookmarkShapeProps>

const Versions = {
	NullAssetId: 1,
	MakeUrlsValid: 2,
} as const

export { Versions as bookmarkShapeVersions }

/** @internal */
export const bookmarkShapeMigrations = createRecordPropsMigrations({
	sequence: [
		{
			version: Versions.NullAssetId,
			up: (props) => {
				if (props.assetId === undefined) {
					props.assetId = null
				}
			},
			down: RETIRED_DOWN_MIGRATION,
		},
		{
			version: Versions.MakeUrlsValid,
			up: (props) => {
				if (!T.linkUrl.isValid(props.url)) {
					props.url = ''
				}
			},
			down: (_props) => {
				// noop
			},
		},
	],
})
