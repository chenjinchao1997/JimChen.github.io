class A {
  #prop = "A#prop";
  get #propgetter() {
    return "A#propgetter";
  }
  static stprop = 0;
  constructor(name) {
    this.name = name;
  }

  #prFunc() {
    return "pr";
  }

  Afunction() {
    console.log(this, this.name);
    console.log(this.#prop);
    console.log(this.#prFunc());
  }

  static stAfunc() {
    console.log(this);
    return this;
  }
}

class B extends A {
  #prop = "B#prop";
  static stprop = 1;
  static #pstprop = 1;
  constructor(name, id) {
    super(name);
    this.id = id;
  }

  Bfunction() {
    console.log(this, this.id);
    console.log(this.#prop);
    console.log(this.#pstprop);
    console.log(this.#stFunc());
    super.Afunction();
  }

  static stBfunc() {
    console.log(this);
    return this;
  }
  static #stFunc() {
    return this.#pstprop;
  }
}
