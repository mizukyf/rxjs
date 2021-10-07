# Observable

種々のObservableは遅延処理に基づくプッシュ型コレクションです。それらは次の表のセルを埋める要素の1つです：

| | 単一値を生む | 複数値を生む |
| --- | --- | --- |
| **プル型** | [`Function`](https://developer.mozilla.org/en-US/docs/Glossary/Function) | [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) |
| **プッシュ型** | [`Promise`](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise) | [`Observable`](/api/index/class/Observable) |

**例を示しましょう。** 次のコードはあるObservableインスタンスを生成するものです。このObservableはsubscribe()されると直ちに（同期的に）`1`、`2`、`3` という値をプッシュします。そしてそれから1秒後に `4` という値を生成して、完了します。

```ts
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});
```

Observableを実行して値を生み出すには、 *subscribe* を呼び出してやる必要があります：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});

console.log('subscribeの直前');
observable.subscribe({
  next(x) { console.log('次の値を得ました ' + x); },
  error(err) { console.error('何か間違ってます: ' + err); },
  complete() { console.log('完了しました'); }
});
console.log('subscribeの直後');
```

これを実行するとコンソールには次のように出力されるでしょう:

```none
subscribe直前
次の値を得ました 1
次の値を得ました 2
次の値を得ました 3
subscribe直後
次の値を得ました 4
完了しました
```

## プル対プッシュ

*プル* と *プッシュ* は、データの *生産者（Producer）* とデータの*消費者（Consumer）* がどのようにやり取りをするかをプログラムで記述するための2つの異なる方法を表しています。

**プルとは何でしょうか？** プル型の仕組みにおいては、生産者が生み出すデータをいつ受け取るかを決めるのは消費者です。生産者はデータがいつ消費者のもとに届けられるか関知しません。

すべてのJavaScriptの関数はプル型の仕組みと捉えることができます。関数はデータの生産者であり、関数を呼び出すコードは *単一の* 戻り値を取り出して（プルして）消費します。

ES2015ではもう1つのプル型の仕組みとみなすことができる [ジェネレータ関数とイテレータ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) (`function*`)が導入されました。`iterator.next()` を呼び出すコードは消費者であり、イテレーター（生産者）から *複数の*
値を取り出して（プルして）消費します。



| | 生産者（Producer） | 消費者（Consumer） |
| --- | --- | --- |
| **プル型** | **受動的:** 要求された時データを生成する | **能動的:** いつデータを要求するか決める |
| **プッシュ型** | **能動的:** 自分自身のペースでデータを生成する | **受動的:** データを受信した時にリアクションする |

**プッシュとは何でしょうか？** プッシュ型の仕組みにおいては、データがいつ消費者のもとに届けられるかを決めるのは生産者です。消費者はデータがいつ手元に届けられるか関知しません。

Promiseは今日のJavaScriptでもっとも一般的に知られたプッシュ型の仕組みです。プロミス（データの生産者）は解決された値をあらかじめ登録されたコールバック関数（データの消費者）に配信します。プル型の仕組みの説明で例示した関数呼び出しと異なり、Promiseは値がいつコールバックに対して配信されるか正確に決める立場にいます。

RxJSはJavaScriptにおける新しいプッシュ型の仕組みとしてObservableを提供します。Observableは複数値を生み出す生産者であり、 Observer （消費者）にその値を配信します。

- **Function** は遅延評価されます。〔というのは値そのものを表すのではなく、必要になった時にそれを呼び出すことで値が得られるので。〕関数は呼び出しの都度、単一値を同期的に返します。
- **ジェネレータ** もまた遅延評価されます。〔同上の観点で。〕ジェネレータは1つも値を生成しないこともあれば無限に値を返すこともあります。それらの値は繰り返し処理の中で同期的に返します。
- **Promise** はいずれ単一の値を返します（エラーによりいかなる値も返さないこともあります）。
- **Observable** は遅延評価されます。同期的ないし非同期的に値を返します。subscribe()がされたあとObservableは1つも値を生成しないこともあれば無限に値を返すこともあります。

<span class="informal">ObservableをPromiseへと変換したい時に参考になる情報についてはこちらの [こちらの案内](/deprecations/to-promise) を参照してください。</span>

## 関数の一般化としてのObservable

しばしば言われることとは異なり、ObservableはEventEmitterのようなものでも、複数値のためのPromiseのようなものでもありません。
ObservableがいくつかのケースでEventEmitterのように振る舞い *得る* のは事実です。それはRxJSのSubjectを利用してマルチキャストを行うケースです。しかし一般的にはObservableはEventEmitterと異なる振る舞いをします。

<span class="informal">Observableは引数なしの関数に似ています。しかし関数と異なり、複数の値を生起することができます。</span>

次のコードを見てみましょう；

```ts
function foo() {
  console.log('Hello');
  return 42;
}

const x = foo.call(); // foo()と同じ
console.log(x);
const y = foo.call(); // foo() と同じ
console.log(y);
```

出力結果は次のようになるでしょう：

```none
"Hello"
42
"Hello"
42
```

上で示したのと同じことを、Observableを使って記述することができます:

```ts
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
});

foo.subscribe(x => {
  console.log(x);
});
foo.subscribe(y => {
  console.log(y);
});
```

出力結果は同じです：

```none
"Hello"
42
"Hello"
42
```

このようになるのは、関数もObservableも、〔値が必要になるその時にまで何も起きないという点で〕遅延評価型の挙動を示すからです。
もし関数を呼び出さなければ、 `console.log('Hello')` は実行されません。
Observableもまた、もし （`subscribe` により）"呼び出" さなければ、 `console.log('Hello')` は実行されません。
加えるに、"呼び出すこと（calling）" と "購読すること（subscribing）" は他から分離された処理です。つまり、2つの関数呼び出しは2つの独立した副作用を生じさせ、2つの購読（subscribe）は2つの独立した副作用を生じさせます。
副作用を共有し、購読者の存否を考慮することなしに〔値の消費者の状態に関わらず、それ自身のペースで値を生成していくという点で〕先行評価型の挙動を示す EventEmitterとは対象的に、Observableは副作用を共有せず遅延評価型の挙動を示します。

<span class="informal">Observableを購読すること（subscribing）は関数を呼び出すこと（calling） に似ています。</span>

Observableは非同期的であるということを言う人がいます。しかしこれは正しくありません。ある関数の呼び出しコードの前後にログ出力のコードを入れるとしましょう：

```js
console.log('before');
console.log(foo.call());
console.log('after');
```

結果は次のようになります：

```none
"before"
"Hello"
42
"after"
```

そしてObservableも同じように振る舞います：

```js
console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

結果は次のようになります：

```none
"before"
"Hello"
42
"after"
```

このことは `foo` の購読が、関数呼び出しと同じく、完全に同期的に行われることを示しています。

<span class="informal">Observableは値を生成しますが、それは同期的に行われるもあれば非同期的に行われることもあります。</span>

Observableと関数の違いは何でしょうか？
**Observableは時間とともに複数の値を "返す" ことができますが**、関数はそうではありません。
したがって次のようなことはできないのです：

```js
function foo() {
  console.log('Hello');
  return 42;
  return 100; // デッドコード。決して実行されません。
}
```

関数は単一値を返すことしかできません。一方、Observableにはそれが可能です：

```ts
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
  subscriber.next(100); // 別の値を "返す"
  subscriber.next(200); // また別の値を "返す"
});

console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

同期的な出力が得られます：

```none
"before"
"Hello"
42
100
200
"after"
```

しかし値を非同期的に "返す" こともできます：

```ts
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
  subscriber.next(100);
  subscriber.next(200);
  setTimeout(() => {
    subscriber.next(300); //非同期的に実行される
  }, 1000);
});

console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

出力結果は：

```none
"before"
"Hello"
42
100
200
"after"
300
```

まとめましょう:

- `func.call()` というコードは "*同期的に、単一の値をください*" という意味になります。
- `observable.subscribe()` というコードは "*同期的ないし非同期的に、ある限りの値をください*" という意味になります。

## Anatomy of an Observable

Observables are **created** using `new Observable` or a creation operator, are **subscribed** to with an Observer, **execute** to deliver `next` / `error` / `complete` notifications to the Observer, and their execution may be **disposed**. These four aspects are all encoded in an Observable instance, but some of these aspects are related to other types, like Observer and Subscription.

Core Observable concerns:
- **Creating** Observables
- **Subscribing** to Observables
- **Executing** the Observable
- **Disposing** Observables

### Creating Observables

The `Observable` constructor takes one argument: the `subscribe` function.

The following example creates an Observable to emit the string `'hi'` every second to a subscriber.

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  const id = setInterval(() => {
    subscriber.next('hi')
  }, 1000);
});
```

<span class="informal">Observables can be created with `new Observable`. Most commonly, observables are created using creation functions, like `of`, `from`, `interval`, etc.</span>

In the example above, the `subscribe` function is the most important piece to describe the Observable. Let's look at what subscribing means.

### Subscribing to Observables

The Observable `observable` in the example can be *subscribed* to, like this:

```ts
observable.subscribe(x => console.log(x));
```

It is not a coincidence that `observable.subscribe` and `subscribe` in `new Observable(function subscribe(subscriber) {...})` have the same name. In the library, they are different, but for practical purposes you can consider them conceptually equal.

This shows how `subscribe` calls are not shared among multiple Observers of the same Observable. When calling `observable.subscribe` with an Observer, the function `subscribe` in `new Observable(function subscribe(subscriber) {...})` is run for that given subscriber. Each call to `observable.subscribe` triggers its own independent setup for that given subscriber.

<span class="informal">Subscribing to an Observable is like calling a function, providing callbacks where the data will be delivered to.</span>

This is drastically different to event handler APIs like `addEventListener` / `removeEventListener`. With `observable.subscribe`, the given Observer is not registered as a listener in the Observable. The Observable does not even maintain a list of attached Observers.

A `subscribe` call is simply a way to start an "Observable execution" and deliver values or events to an Observer of that execution.

### Executing Observables

The code inside `new Observable(function subscribe(subscriber) {...})` represents an "Observable execution", a lazy computation that only happens for each Observer that subscribes. The execution produces multiple values over time, either synchronously or asynchronously.

There are three types of values an Observable Execution can deliver:

- "Next" notification: sends a value such as a Number, a String, an Object, etc.
- "Error" notification: sends a JavaScript Error or exception.
- "Complete" notification: does not send a value.

"Next" notifications are the most important and most common type: they represent actual data being delivered to a subscriber. "Error" and "Complete" notifications may happen only once during the Observable Execution, and there can only be either one of them.

These constraints are expressed best in the so-called *Observable Grammar* or *Contract*, written as a regular expression:

```none
next*(error|complete)?
```

<span class="informal">In an Observable Execution, zero to infinite Next notifications may be delivered. If either an Error or Complete notification is delivered, then nothing else can be delivered afterwards.</span>

The following is an example of an Observable execution that delivers three Next notifications, then completes:

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});
```

Observables strictly adhere to the Observable Contract, so the following code would not deliver the Next notification `4`:

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  subscriber.next(4); // Is not delivered because it would violate the contract
});
```

It is a good idea to wrap any code in `subscribe` with `try`/`catch` block that will deliver an Error notification if it catches an exception:

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  try {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  } catch (err) {
    subscriber.error(err); // delivers an error if it caught one
  }
});
```

### Disposing Observable Executions

Because Observable Executions may be infinite, and it's common for an Observer to want to abort execution in finite time, we need an API for canceling an execution. Since each execution is exclusive to one Observer only, once the Observer is done receiving values, it has to have a way to stop the execution, in order to avoid wasting computation power or memory resources.

When `observable.subscribe` is called, the Observer gets attached to the newly created Observable execution. This call also returns an object, the `Subscription`:

```ts
const subscription = observable.subscribe(x => console.log(x));
```

The Subscription represents the ongoing execution, and has a minimal API which allows you to cancel that execution. Read more about the [`Subscription` type here](./guide/subscription). With `subscription.unsubscribe()` you can cancel the ongoing execution:

```ts
import { from } from 'rxjs';

const observable = from([10, 20, 30]);
const subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
```

<span class="informal">When you subscribe, you get back a Subscription, which represents the ongoing execution. Just call `unsubscribe()` to cancel the execution.</span>

Each Observable must define how to dispose resources of that execution when we create the Observable using `create()`. You can do that by returning a custom `unsubscribe` function from within `function subscribe()`.

For instance, this is how we clear an interval execution set with `setInterval`:

```js
const observable = new Observable(function subscribe(subscriber) {
  // Keep track of the interval resource
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);

  // Provide a way of canceling and disposing the interval resource
  return function unsubscribe() {
    clearInterval(intervalId);
  };
});
```

Just like `observable.subscribe` resembles `new Observable(function subscribe() {...})`, the `unsubscribe` we return from `subscribe` is conceptually equal to `subscription.unsubscribe`. In fact, if we remove the ReactiveX types surrounding these concepts, we're left with rather straightforward JavaScript.

```js
function subscribe(subscriber) {
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);

  return function unsubscribe() {
    clearInterval(intervalId);
  };
}

const unsubscribe = subscribe({next: (x) => console.log(x)});

// Later:
unsubscribe(); // dispose the resources
```

The reason why we use Rx types like Observable, Observer, and Subscription is to get safety (such as the Observable Contract) and composability with Operators.
