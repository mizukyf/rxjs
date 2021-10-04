# はじめに

RxJSは "オブザーバブルなシーケンス" を利用して非同期かつイベントベースのプログラムを構成するためのライブラリです。
〔 "オブザーバブルなシーケンス" とはGoFのデザインパターンの1つ、ObserverパターンにおけるSubjectとそれが1回ないし複数回に渡って生起するイベントのコレクションです。〕
このライブラリは中核となる型である [Observable](./guide/observable) 、それとともに用いられる複数の型（Observer、Schedulers、Subjects）そして複数のオペレーターを提供します。
オペレーターは [Array#extras](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6) （map、filter、reduce、everyなど）に触発されたもので、非同期に発生するイベントをコレクション（シーケンス）として処理することを可能にするものです。

<span class="informal">RxJSはイベントに特化したLodashのようなものです。</span>

RxJSもその一部であるところのツールセットReactiveX（Reactive Extensions）は [Observerパターン](https://en.wikipedia.org/wiki/Observer_pattern) と [Iteratorパターン](https://en.wikipedia.org/wiki/Iterator_pattern)、そして [コレクションを操作する関数型プログラミング](http://martinfowler.com/articles/collection-pipeline/#NestedOperatorExpressions)を組み合わせたものです。このツールセットはイベントのシーケンス（コレクション）を管理する概念的な方法を提供するために考案されました。

非同期に生起するイベントを管理するためにRxJSが用いる最重要概念は次のものです：

- **Observable:** いずれ得られる値のコレクションないしいずれ起こるイベントのコレクションを表すオブジェクトです。
- **Observer:** Observableから届けられる値をどのように受け取り処理するかを定義したコールバック関数の集まりです。
- **Subscription:** Observableの "実行" を表すオブジェクトで、これを通じて "実行" の中止を働きかけることができます。
- **Operators:** 通常のコレクションに対する `map`、`filter`、`concat`、 `reduce`のような方法で、オブザーバブルなシーケンスに対する関数型プログラミングを可能にする純粋な（つまり副作用を伴わない）関数群です。
- **Subject:** これは `EventEmitter` と同義で、値やイベントを複数のObserverたちに一斉配信するものです。
- **Schedulers:** 並列処理を制御する司令係であり、 `setTimeout` や `requestAnimationFrame` その他により生起する計算処理を連携させることを可能にします。

## 最初の例

今までイベントリスナーを登録する場合次のようにしてきたと思います。

```ts
document.addEventListener('click', () => console.log('Clicked!'));
```

これに対して、RxJSを使う場合、Observableを作成します。

```ts
import { fromEvent } from 'rxjs';

fromEvent(document, 'click').subscribe(() => console.log('Clicked!'));
```

### Purity

What makes RxJS powerful is its ability to produce values using pure functions. That means your code is less prone to errors.

Normally you would create an impure function, where other
pieces of your code can mess up your state.

```ts
let count = 0;
document.addEventListener('click', () => console.log(`Clicked ${++count} times`));
```

Using RxJS you isolate the state.

```ts
import { fromEvent } from 'rxjs';
import { scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(scan(count => count + 1, 0))
  .subscribe(count => console.log(`Clicked ${count} times`));
```

The **scan** operator works just like **reduce** for arrays. It takes a value which is exposed to a callback. The returned value of the callback will then become the next value exposed the next time the callback runs.

### Flow

RxJS has a whole range of operators that helps you control how the events flow through your observables.

This is how you would allow at most one click per second, with plain JavaScript:

```ts
let count = 0;
let rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', () => {
  if (Date.now() - lastClick >= rate) {
    console.log(`Clicked ${++count} times`);
    lastClick = Date.now();
  }
});
```

With RxJS:

```ts
import { fromEvent } from 'rxjs';
import { throttleTime, scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(
    throttleTime(1000),
    scan(count => count + 1, 0)
  )
  .subscribe(count => console.log(`Clicked ${count} times`));
```

Other flow control operators are [**filter**](../api/operators/filter), [**delay**](../api/operators/delay), [**debounceTime**](../api/operators/debounceTime), [**take**](../api/operators/take), [**takeUntil**](../api/operators/takeUntil), [**distinct**](../api/operators/distinct), [**distinctUntilChanged**](../api/operators/distinctUntilChanged) etc.

### Values

You can transform the values passed through your observables.

Here's how you can add the current mouse x position for every click, in plain JavaScript:

```ts
let count = 0;
const rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', event => {
  if (Date.now() - lastClick >= rate) {
    count += event.clientX;
    console.log(count);
    lastClick = Date.now();
  }
});
```

With RxJS:

```ts
import { fromEvent } from 'rxjs';
import { throttleTime, map, scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(
    throttleTime(1000),
    map(event => event.clientX),
    scan((count, clientX) => count + clientX, 0)
  )
  .subscribe(count => console.log(count));
```

Other value producing operators are [**pluck**](../api/operators/pluck), [**pairwise**](../api/operators/pairwise), [**sample**](../api/operators/sample) etc.
