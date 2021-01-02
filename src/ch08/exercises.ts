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
      worker.onmessage = event => resolve(event.data)
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

type Data<
  P extends Protocol,
  C extends keyof P = keyof P
> = C extends C
  ? {command: C; args: P[C]['in']}
  : never

function handle(
  data: Data<MatrixProtocol>
): MatrixProtocol[typeof data.command]['out'] {
  switch (data.command) {
    case 'determinant':
      return determinant(...data.args)
    case 'dot-product':
      return dotProduct(...data.args)
    case 'invert':
      return invert(...data.args)
  }
}

onmessage = ({data}) => postMessage(handle(data))

declare function determinant(matrix: Matrix): number
declare function dotProduct(matrixA: Matrix, matrixB: Matrix): Matrix
declare function invert(matrix: Matrix): Matrix

// 3. Use a mapped type (as in 「8.6.1 In the Browser: With Web Workers★」) to implement a typesafe message-passing protocol for NodeJS's `child_process`.

// MainThread.ts
import {fork} from 'child_process'

function createProtocolCP<P extends Protocol>(script: string) {
  return <K extends keyof P>(command: K) => (...args: P[K]['in']) =>
    new Promise<P[K]['out']>((resolve, reject) => {
      let child = fork(script)
      child.on('error', reject)
      child.on('message', resolve)
      child.send({command, args})
    })
}

let runWithMatrixProtocolCP = createProtocolCP<MatrixProtocol>(
  './ChildThread.js'
)
let parallelDeterminantCP = runWithMatrixProtocolCP('determinant')

parallelDeterminantCP([[1, 2], [3, 4]]).then(
  determinant => console.log(determinant) // -2
)

// ChildThread.ts

// type Data ...
// function handle ...

process.on('message', data => process.send!(handle(data)))
