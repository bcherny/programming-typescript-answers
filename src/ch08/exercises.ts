export default null // Force module mode

// 1. Implement a general-purpose promisify function, which takes any function that takes exactly one argument and a callback, and wraps it in a function that returns a promise.
function promisify<T, A>(
  f: (arg: A, f: (error: unknown, result: T | null) => void) => void
): (arg: A) => Promise<T> {
  return (arg: A) =>
    new Promise<T>((resolve, reject) =>
      f(arg, (error, result) => {
        if (error) {
          return reject(error)
        }
        if (result === null) {
          return reject(null)
        }
        resolve(result)
      })
    )
}

import {readFile} from 'fs'

let readFilePromise = promisify(readFile)
readFilePromise(__dirname + '/exercises.js').then(result =>
  console.log('done!', result.toString())
)

// 2. In the section on Typesafe Protocols we derived one half of a protocol for typesafe matrix math. Given this half of the protocol that runs in the main thread, implement the other half that runs in a Web Worker thread.

type Matrix = number[][]

type MatrixProtocol = {
  determinant: {
    in: [Matrix]
    out: number
  }
  'dot-product': {
    in: [Matrix, Matrix]
    out: Matrix
  }
  invert: {
    in: [Matrix]
    out: Matrix
  }
}

// MainThread.ts
type Protocol = {
  [command: string]: {
    in: unknown[]
    out: unknown
  }
}

function createProtocol<P extends Protocol>(script: string) {
  return <K extends keyof P>(command: K) => (...args: P[K]['in']) =>
    new Promise<P[K]['out']>((resolve, reject) => {
      let worker = new Worker(script)
      worker.onerror = reject
      worker.onmessage = event => resolve(event.data.data)
      worker.postMessage({command, args})
    })
}

let runWithMatrixProtocol = createProtocol<MatrixProtocol>(
  'MatrixWorkerScript.js'
)
let parallelDeterminant = runWithMatrixProtocol('determinant')

parallelDeterminant([[1, 2], [3, 4]]).then(
  determinant => console.log(determinant) // -2
)

// WorkerScript.ts

let handlers: {
  [C in keyof MatrixProtocol]: (
    ...args: MatrixProtocol[C]['in']
  ) => MatrixProtocol[C]['out']
} = {
  determinant(matrix) {
    return determinant(matrix)
  },
  ['dot-product'](a, b) {
    return dotProduct(a, b)
  },
  invert(matrix) {
    return invert(matrix)
  }
}

onmessage = <C extends keyof MatrixProtocol>({
  data: {command, args}
}: {
  data: {command: C; args: MatrixProtocol[C]['in']}
}) => {
  let handler = handlers[command]
  let result = handler(...args)
  postMessage(result)
}

declare function determinant(matrix: Matrix): number
declare function dotProduct(matrixA: Matrix, matrixB: Matrix): Matrix
declare function invert(matrix: Matrix): Matrix
