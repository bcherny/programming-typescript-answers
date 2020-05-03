export default null // Force module mode

// 1. Which parts of a function’s type signature does TypeScript infer: the parameters, the return type, or both?

/* TypeScript always infers a function's return type. TypeScript sometimes
infers a function's parameter types, if it can infer them from context (for
example, if the function is a callback). */

// 2. Is JavaScript’s arguments object typesafe? If not, what can you use instead?

/* arguments is not typesafe. Instead, you should use a rest parameter:

Before: function f() { console.log(arguments) }

After: function f(...args: unknown[]) { console.log(args) }
*/

// 3. I want the ability to book a vacation that starts immediately. Update the
// overloaded reserve function from earlier in this chapter (Overloaded Function
// Types) with a third call signature that takes just a destination, without an
// explicit start date.

type Reservation = unknown

type Reserve = {
  (from: Date, to: Date, destination: string): Reservation
  (from: Date, destination: string): Reservation
  (destination: string): Reservation
}

let reserve: Reserve = (
  fromOrDestination: Date | string,
  toOrDestination?: Date | string,
  destination?: string
) => {
  if (
    fromOrDestination instanceof Date &&
    toOrDestination instanceof Date &&
    destination !== undefined
  ) {
    // Book a one-way trip
  } else if (
    fromOrDestination instanceof Date &&
    typeof toOrDestination === 'string'
  ) {
    // Book a round trip
  } else if (typeof fromOrDestination === 'string') {
    // Book a trip right away
  }
}

// 4. [Hard] Update our call implementation from earlier in the chapter (Using
// Bounded Polymorphism to Model Arity) to only work for functions whose second
// argument is a string. For all other functions, your implementation should
// fail at compile time.

function call<T extends [unknown, string, ...unknown[]], R>(
  f: (...args: T) => R,
  ...args: T
): R {
  return f(...args)
}

function fill(length: number, value: string): string[] {
  return Array.from({length}, () => value)
}

call(fill, 10, 'a') // string[]

// 5. Implement a small typesafe assertion library, is. Start by sketching out
// your types. When you’re done, I should be able to use it like this:

// Compare a string and a string
is('string', 'otherstring') // false

// Compare a boolean and a boolean
is(true, false) // false

// Compare a number and a number
is(42, 42) // true

// Comparing two different types should give a compile-time error
is(10, 'foo') // Error TS2345: Argument of type '"foo"' is not assignable
// to parameter of type 'number'.

// [Hard] I should be able to pass any number of arguments
is([1], [1, 2], [1, 2, 3]) // false

function is<T>(a: T, ...b: [T, ...T[]]): boolean {
  return b.every(_ => _ === a)
}
