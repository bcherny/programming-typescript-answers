export default null // Force module mode

// 1. For each of these values, what type will TypeScript infer?

// 1a
let a = 1042 // number

// 1b
let b = 'apples and oranges' // string

// 1c
const c = 'pineapples' // 'pineapples'

// 1d
let d = [true, true, false] // boolean[]

// 1e
let e = {type: 'ficus'} // {type: string}

// 1f
let f = [1, false] // (number | boolean)[]

// 1g
const g = [3] // number[]

// 1h
let h = null // any

// 2. Why does each of these throw the error it does?

// 2a
let i: 3 = 3
i = 4 // Error TS2322: Type '4' is not assignable to type '3'.

/*
i's type is the type literal 3. The type of 4 is the type literal 4, which is not assignable to the type literal 3.
*/

// 2b
let j = [1, 2, 3]
j.push(4)
j.push('5') // Error TS2345: Argument of type '"5"' is not
// assignable to parameter of type 'number'.

/*
Since j was initialized with a set of numbers, TypeScript inferred j's type as number[].
The type of '5' is the type literal '5', which is not assignable to number.
*/

// 2c
let k: never = 4 // Error TS2322: Type '4' is not assignable to type 'never'.

/*
never is the bottom type. That means it's assignable to every other type, but no type is
assignable to never.
*/

// 2d
let l: unknown = 4
let m = l * 2 // Error TS2571: Object is of type 'unknown'.

/*
unknown represent a value that could be anything at runtime. To prove to TypeScript that what
you're doing is safe, you have to first prove to TypeScript that a value of type unknown actually
has a more specific subtype. You do that by refining the value using typeof, instanceof, or
another type query or type guard.
*/
