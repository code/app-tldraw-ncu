/** @public */
export type SetValue<T extends Set<any>> = T extends Set<infer U> ? U : never

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I
) => void
	? I
	: never
