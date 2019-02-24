// 1. Design a way to handle errors for the following API, using one of the patterns from this chapter. In this API, every operation might fail — feel free to update the API’s method signatures to allow for failures (or don’t, if you prefer). Think about how you might perform a sequence of actions while handling errors that come up (eg. getting the logged in user’s ID, then getting their list of friends).

type UserID = unknown

declare class API {
  getLoggedInUserID(): Option<UserID>
  getFriendIDs(userID: UserID): Option<UserID[]>
  getUserName(userID: UserID): Option<string>
}

interface Option<T> {
  flatMap<U>(f: (value: T) => None): None
  flatMap<U>(f: (value: T) => Option<U>): Option<U>
  getOrElse(value: T): T
}
class Some<T> implements Option<T> {
  constructor(private value: T) {}
  flatMap<U>(f: (value: T) => None): None
  flatMap<U>(f: (value: T) => Some<U>): Some<U>
  flatMap<U>(f: (value: T) => Option<U>): Option<U> {
    return f(this.value)
  }
  getOrElse(): T {
    return this.value
  }
}
class None implements Option<never> {
  flatMap(): None {
    return this
  }
  getOrElse<U>(value: U): U {
    return value
  }
}

function listOfOptionsToOptionOfList<T>(list: Option<T>[]): Option<T[]> {
  let empty = {}
  let result = list.map(_ => _.getOrElse(empty as T)).filter(_ => _ !== empty)
  if (result.length) {
    return new Some(result)
  }
  return new None()
}

let api = new API()
let friendsUserNames = api
  .getLoggedInUserID()
  .flatMap(api.getFriendIDs)
  .flatMap(_ => listOfOptionsToOptionOfList(_.map(api.getUserName)))

// 2. [Hard] Implement the Try datatype. Try is a lot like Option, and lets you chain possibly-errored computations. Like Option, it has two cases: Success<T> (like Some<T>), and Failure<T> (like None). Success<T> represents a successful computation, and can be mapped with flatMap; Failure<T> represents an exception, and can be recovered from with recoverWith.

// Unlike Option, Try doesn’t just give you a None when something failed; it instead keeps track of the first exception that happened, so that you can choose to either recover from it or let it fail. The same way that you can’t read a value directly from Option, so you can’t read the value and exceptions directly from Try; instead, you can call recoverWith with a function, and if the Try is a Failure<T>, recoverWith will call your function with the exception. Try's API looks like this:

// TODO
