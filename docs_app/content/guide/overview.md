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

### 純粋さ（副作用の回避）

RxJSを強力なものとしているのは、純粋な関数（副作用を伴わない関数）を使って値を生成する能力です。純粋な関数の使用はあなたのコードからエラーが起きるリスクを低減します。

純粋でない関数（副作用を伴う関数）は、あなたが書いた他のコードにより状態（ステート）を意図しない形で書き換えられてしまうリスクを孕んでいます。
〔次のコードではイベントリスナー関数がその外側のスコープにある変数 `count` を参照更新していますが、この変数はスコープを共有する他のコードから参照更新できてしまいます。〕

```ts
let count = 0;
document.addEventListener('click', () => console.log(`Clicked ${++count} times`));
```

RxJSを使用することであなたは状態（ステート）を分離することができます。

```ts
import { fromEvent } from 'rxjs';
import { scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(scan(count => count + 1, 0))
  .subscribe(count => console.log(`Clicked ${count} times`));
```

**scan** オペレーターはちょうど配列に対する **reduce** のように働きます。このオペレーターが第2引数による値は第1引数のコールバック関数に渡されます。コールバック関数が実行され値を返すと、今度はその値が同じコールバック関数に渡されます。以降この繰り返しです。

### フロー

RxJSはObservableオブジェクトから通知されるイベントの流れを制御するために広範な用途のオペーレーター群を提供しています。

例えば、1秒あたり1クリックまでという制限のもとで何かをさせたいという場合を考えます。RxJSを使用しない場合は次のようになるでしょう：

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

RxJSを使用する場合は次のようになります：

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

その他のフロー制御オペレーターには、[**filter**](../api/operators/filter)、 [**delay**](../api/operators/delay)、 [**debounceTime**](../api/operators/debounceTime)、 [**take**](../api/operators/take)、 [**takeUntil**](../api/operators/takeUntil)、 [**distinct**](../api/operators/distinct)、 [**distinctUntilChanged**](../api/operators/distinctUntilChanged) などがあります。

### 値のシーケンス

Observableオブジェクトから配信された値を変換することもできます。

例えば、クリック・イベントのたびにイベント発生時点のマウスカーソルのX座標の値を足し合わせていく処理を考えます。RxJSを使用しない場合は次のようになるでしょう：

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

RxJSを使用する場合は次のようになります：

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

その他の値生成オペレーターには、 [**pluck**](../api/operators/pluck)、 [**pairwise**](../api/operators/pairwise)、 [**sample**](../api/operators/sample) などがあります。
