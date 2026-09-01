type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type MergeTypes<TypesArray extends any[], Res = {}> = TypesArray extends [
    infer Head,
    ...infer Rem,
]
    ? MergeTypes<Rem, Res & Head>
    : Res;

type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };

type OneOf<
    TypesArray extends any[],
    Res = never,
    AllProperties = MergeTypes<TypesArray>,
> = TypesArray extends [infer Head, ...infer Rem]
    ? OneOf<Rem, Res | OnlyFirst<Head, AllProperties>, AllProperties>
    : Res;

type Nullable<T> = T | null | undefined;

type NullableRecord<T> = {
    [K in keyof T]: T[K] | null | undefined;
};
