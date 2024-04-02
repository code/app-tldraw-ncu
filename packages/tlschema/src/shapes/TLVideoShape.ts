import { T } from '@tldraw/validate'
import { assetIdValidator } from '../assets/TLBaseAsset'
import {
	RETIRED_DOWN_MIGRATION,
	RecordPropsType,
	createRecordPropsMigrations,
} from '../propsMigrations'
import { TLBaseShape } from './TLBaseShape'

/** @public */
export const videoShapeProps = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	time: T.number,
	playing: T.boolean,
	url: T.linkUrl,
	assetId: assetIdValidator.nullable(),
}

/** @public */
export type TLVideoShapeProps = RecordPropsType<typeof videoShapeProps>

/** @public */
export type TLVideoShape = TLBaseShape<'video', TLVideoShapeProps>

const Versions = {
	AddUrlProp: 1,
	MakeUrlsValid: 2,
} as const

export { Versions as videoShapeVersions }

/** @internal */
export const videoShapeMigrations = createRecordPropsMigrations({
	sequence: [
		{
			version: Versions.AddUrlProp,
			up: (props) => {
				props.url = ''
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
