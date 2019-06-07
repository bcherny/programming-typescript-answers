export default null // Force module mode

// 1. What’s the difference between a class and an interface?

/* A class can have implementations, initialized class fields, and visibility modifiers. It also generates JavaScript code, so it supports instanceof checks at runtime. A class defines both a type and a value. An interface just defines a type, doesn't generate any JavaScript code, can only contain type-level members, and can't contain use modifiers. */

// 2. When you mark a class' constructor as `private`, that means you can't instantiate or extend the class. What happens when you mark it as `protected` instead? Play around with this in your code editor, and see if you can figure it out.

class A {
  protected constructor() {}
}

class B extends A {} // ok
new A() // error
new B() // error

/* Unlike a class with a private constructor, a class with a protected constructor can be extended. Neither a class with a private constructor nor a class with a protected constructor can be new-ed. */

// 3. Extend the Factory Pattern implementation we developed (Factory Pattern) to make it safer, at the expense of breaking the abstraction a bit. Update the implementation so that a consumer knows at compile time that calling Shoe.create('boot') returns a Boot, and Shoe.create('balletFlat') returns a BalletFlat (rather than both returning a Shoe). Hint: Think back to [function-overloads].

type Shoe = {
  purpose: string
}

class BalletFlat implements Shoe {
  purpose = 'dancing'
}

class Boot implements Shoe {
  purpose = 'woodcutting'
}

class Sneaker implements Shoe {
  purpose = 'walking'
}

type ShoeCreator = {
  create(type: 'balletFlat'): BalletFlat
  create(type: 'boot'): Boot
  create(type: 'sneaker'): Sneaker
}

let Shoe: ShoeCreator = {
  create(type: 'balletFlat' | 'boot' | 'sneaker'): Shoe {
    switch (type) {
      case 'balletFlat':
        return new BalletFlat()
      case 'boot':
        return new Boot()
      case 'sneaker':
        return new Sneaker()
    }
  }
}

Shoe.create('balletFlat') // BalletFlat
Shoe.create('boot') // Boot
Shoe.create('sneaker') // Sneaker

// 4. [Hard] As an exercise, think about how you might design a typesafe builder pattern. Extend the Builder pattern Builder Pattern example from earlier in this chapter to:

// 4a. Guarantee at compile time that someone can’t call .send() before setting at least URL and method. Would it be easier to make this guarantee if you also force the user to call methods in a specific order? (Hint: what can you return instead of this?)

class RequestBuilder {
  protected data: object | null = null
  protected method: 'get' | 'post' | null = null
  protected url: string | null = null

  setMethod(method: 'get' | 'post'): RequestBuilderWithMethod {
    return new RequestBuilderWithMethod().setMethod(method).setData(this.data)
  }
  setData(data: object | null): this {
    this.data = data
    return this
  }
}

class RequestBuilderWithMethod extends RequestBuilder {
  setMethod(method: 'get' | 'post' | null): this {
    this.method = method
    return this
  }
  setURL(url: string): RequestBuilderWithMethodAndURL {
    return new RequestBuilderWithMethodAndURL()
      .setMethod(this.method)
      .setURL(url)
      .setData(this.data)
  }
}

class RequestBuilderWithMethodAndURL extends RequestBuilderWithMethod {
  setURL(url: string): this {
    this.url = url
    return this
  }
  send() {
    // ...
  }
}

new RequestBuilder()
  .setMethod('get')
  .setData({})
  .setURL('foo.com')
  .send()

// 4b. [Harder] How would you change your design if you wanted to make this guarantee, but still let people call methods in any order?

// (This answer courtesy of @albertywu)

interface BuildableRequest {
  data?: object
  method: 'get' | 'post'
  url: string
}

class RequestBuilder2 {
  data?: object
  method?: 'get' | 'post'
  url?: string

  setData(data: object): this & Pick<BuildableRequest, 'data'> {
    return Object.assign(this, {data})
  }

  setMethod(method: 'get' | 'post'): this & Pick<BuildableRequest, 'method'> {
    return Object.assign(this, {method})
  }

  setURL(url: string): this & Pick<BuildableRequest, 'url'> {
    return Object.assign(this, {url})
  }

  build(this: BuildableRequest) {
    return this
  }
}

new RequestBuilder2()
  .setData({})
  .setMethod('post') // Try removing me!
  .setURL('bar') // Try removing me!
  .build()
