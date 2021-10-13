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

Promiseは今日のJavaScriptでもっとも一般に知られたプッシュ型の仕組みです。プロミス（データの生産者）は解決された値をあらかじめ登録されたコールバック関数（データの消費者）に配信します。プル型の仕組みの説明で例示した関数呼び出しと異なり、Promiseは値がいつコールバックに対して配信されるか正確に決める立場にいます。

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

この出力結果は、今回の `foo` の購読が、関数呼び出しと同じく、完全に同期的に行われたことを示しています。〔つまり、上で示したObservableは同期的な方法で値を返す実装でした。しかし同期的でない方法で値を返す実装も可能なのです。〕

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

そして値を非同期的に "返す" こともできます：

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

## Observableの解剖

Observableは コンストラクタ（`new Observable`）や作成オペレーターにより **作成され**、Observerにより **購読され**、Observerに対して `next` / `error` / `complete` という3種類のメッセージの通知を **実行し**、そしてしばしばSubscriptionにより **破棄され** ることになります。
これら4つの相のすべてが1つのObservableインスタンスに組み込まれています。そしていくつかの相はObserverやSubscriptionのような他の型にも関連します。

Observableの中核となる概念は次の4つです:
- Observable の**作成**
- Observable の**購読**
- Observable の**実行**
- Observables の**破棄** 

### Observableの作成

`Observable` コンストラクタは引数を一つとります： すなわち `subscribe` 関数です。

次に示す例では1秒ごとに  `'hi'` という文字列を生成して購読者に知らせるObservableを作成しています。

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  const id = setInterval(() => {
    subscriber.next('hi')
  }, 1000);
});
```

<span class="informal">このように `new Observable` によりObservableを作成できます。しかしより一般的に用いられる方法として、作成オペレーター関数があります。例えば `of` や `from`、`interval` などがそれです。</span>

上で示した例では、`subscribe` 関数はObservableインスタンスの動作を定義する上でもっとも重要な部品です。それでは 購読（subscribing）の意味するところに目を向けてみましょう。

### Observableを購読する

先の例で登場したObservableのインスタンス `observable` を *購読* するには次のようにします:

```ts
observable.subscribe(x => console.log(x));
```

 `observable.subscribe` メソッドと、 `new Observable(function subscribe(subscriber) {...})` の関数 `subscribe` が同じ名前を持っているのは偶然ではありません。
 このライブラリにおいて、2つは異なる働きをしていますが、実際上概念的に同じものとみなすことができます。

`subscribe` の呼び出しは、同じObservableインスタンスに対する複数のObserverの間で共有されません。
あるObserverインスタンスとともに `observable.subscribe` メソッドを呼び出す時、`new Observable(function subscribe(subscriber) {...})`の `subscribe` 関数は当該の購読者のために実行されます。
`observable.subscribe` メソッドの呼び出しはその都度、引数で指定された購読者のために独立したセットアップ処理を起動します。

<span class="informal">Observableを購読すること（subscribing）は関数を呼び出すこと（calling）に似て、データの配信を待つコールバックをObservableに提供します。</span>

この点が `addEventListener` / `removeEventListener` のようなイベントハンドラAPIと大きく違うところです。
 `observable.subscribe` メソッドはObserverをイベントリスナーのようなものとしてObservableに登録するのではありません。
 Observableは自身に関連付けられたObserverの一覧を保持するわけでもありません。

`subscribe` メソッド呼び出しは単純に "Observableの実行" を開始させ、その実行を観察するObserverに値やイベントを通知するのを開始させる方法に過ぎません。

### Observableを実行する

先程の `new Observable(function subscribe(subscriber) {...})` というコードの内側、subscribe関数の部分は "Observableの実行"
を表現しています。この部分は各Observerがそれを購読しない限り実行されません。ひとたび実行されると時間とともに、同期的ないし非同期的な方法で複数の値が生成されます。

Observableの実行によりObserverに届けられる通知には3つの種類があります：

- "Next" 通知: 数値や文字列、オブジェクトなどが送信されます。
- "Error" 通知: JavaScriptエラーないし例外が送信されます。
- "Complete" 通知: 値は送信されません。

なかでも "Next" 通知はもっとも重要なものであり、もっともよく用いられるものです。この通知により実際のデータが購読者に送信されます。 "Error" 通知と "Complete" 通知はObservableの実行中に1回だけ、それも "Error" と "Complete" のいずれかのみ、行われる可能性があります。

この制限は 正規表現で記述された *Observable グラマー（文法）* ないし *Observableコントラクト（契約）* と呼ばれるもので端的に表されます：

```none
next*(error|complete)?
```

<span class="informal">Observableが実行されるとき、Next通知はゼロ個で終わることもあれば一回だけ、複数回、そして無限回にわたり行われることもあります。ひとたびError通知ないしComplete通知が行われると、その後はいかなる通知も行われません。
</span>

次の例では、Observableインスタンスが3つのNext通知を送信したあと、Complete通知を送信して完了します：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});
```

ObservableはObservableコントラクトをきっちり遵守します。次のコードでは `4` という値はNext通知されません：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  subscriber.next(4); // この操作はコントラクトに違反するので通知を発生させません
});
```

`subscribe` 関数のコードを `try`/`catch` ブロックで囲うのはよい考えです。このブロックにより例外が発生したときError通知を送るのです：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  try {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  } catch (err) {
    subscriber.error(err); // エラーが発生したらそれを通知する
  }
});
```

### Observable実行の破棄

Observableの実行は半永久的に継続しうるので、Observer側でこれを停止させたいということもしばしばあります。そういうわけで実行をキャンセルするAPIが必要になります。Observableの実行はみな特定の1 Observerごとにそれ専用の処理として行われるので、ひとたびObserverが値の受信を終えたら、CPUやメモリのリソースの浪費を避けるため、Observableの実行をストップさせるべきです。

 `observable.subscribe` メソッドを呼び出した時、Observerは新たに生成されたObservable実行〔を表すオブジェクト〕に紐付けられます。そしてこのメソッド呼び出しは `Subscription` というオブジェクトを返します：

```ts
const subscription = observable.subscribe(x => console.log(x));
```

Subscription（購読）オブジェクトは今まさに進行中のObservable実行を表し、その実行をキャンセルするための最小限のAPIを提供します。より詳しい[`Subscription` 型の説明はこちら](./guide/subscription) を参照ください。 `subscription.unsubscribe()` メソッドを使って進行中のObservable実行をキャンセルできます：

```ts
import { from } from 'rxjs';

const observable = from([10, 20, 30]);
const subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
```

<span class="informal">Observableの購読を開始したとき、そのObservableの実行を表すSubscriptionが得られます。 `unsubscribe()` 呼び出しをすることでこの実行をキャンセルすることができます。</span>

 `create()`オペレーターを使用してObservableインスタンスを作成するとき、そのObservableの実行中に使用したリソースを破棄する方法を定義することができます。それには `function subscribe()` の中で `unsubscribe` 関数を返します。〔これはnew演算子でObservableインスタンスを生成するときも同じです。〕

例えば、これはその内部で `setInterval` を使用するObservableに、定期実行をクリアさせてみましょう：

```js
const observable = new Observable(function subscribe(subscriber) {
  // 定期実行のためのリソースを追跡しておく
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);

  // 定期実行をキャンセルしリソースを破棄する方法を提供する
  return function unsubscribe() {
    clearInterval(intervalId);
  };
});
```

ちょうど `observable.subscribe` が `new Observable(function subscribe() {...})` と共通点を持つように、 `subscribe` から返される `unsubscribe` は `subscription.unsubscribe` と概念的に同じものです。
事実、この概念の周囲を取り囲んでいるReactiveXが提供する型を取り除いてしまうと、われわれの手元にはかなりシンプルなJavaScriptコードが残ります。

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

// 後に実行されるコード：
unsubscribe(); // リソースを破棄
```

〔こうして実際に行われていることを突き詰めればごくシンプルなものでありながら、それでもあえて〕 ObservableやObserver、SubscriptionといったReactiveXの型を使ってそれを行う理由は、（Observableコントラクトが購読する側とされる側のコミュニケーション方法を定義するような方法で）安全にそれを実現できるからであり、かつまた、オペレーターの助けによりロジックの組み立てが容易になるからです。
