# RxJS が提供するオペレーター

RxJSはObservableをその土台としているものの、それよりもむしろ _オペレーター_ のほうがが多くの場合に有用です。
オペレーターは複雑な非同期処理のコードを宣言的な方法で容易に構成することを可能にするために必要不可欠な部品です。

## オペレーターとは何者か？

オペレーターは **関数** です。2つの種類のオペレーターが存在します：

**パイプ可能オペレーター（Pipeable Operators）** は `observableInstance.pipe(operator())` という構文でもってObservableに接続（pipe）されます。この種類のオペレーターには[`filter(...)`](/api/operators/filter) や [`mergeMap(...)`](/api/operators/mergeMap)が含まれます。
`pipe(operator())` が呼び出される時、既存のObservableインスタンスに _変更_ は加えられません。このメソッド呼び出しはObservableを変更するのではなく、 _新しい_ Observableインスタンスを返すのです。新たなインスタンスの購読（subscription）ロジックは最初のObservableのそれに基づきます。

<span class="informal">パイプ可能オペレーターは関数です。既存のObservableを入力としてとり、新しい別のObservableを返します。これは副作用を伴わない処理です。つまり元のObservableは変更を受けません。</span>

パイプ可能オペレーターは基本的に純粋な関数、つまり副作用を伴わない関数です。〔`filter(...)` や `mergeMap(...)` という関数呼び出しによりオペレーター関数が返されます。〕オペレーター関数はObservableを入力にとり、別のObservableを生成して出力します。生成された新しいObservableを購読すると、その新しいObservableを通じて、元になったObservableを購読することになります。

**生成オペレーター（Creation Operators）** はもう1つの種類のオペレーターです。この種類のオペレーターは新しいObservableを生成するために単独で〔というのは `pipe()` を使って既存のObservableと組み合わせる必要なく〕呼び出すことができる関数です。
例えば、 `of(1, 2, 3)` というオペレーター関数呼び出しにより生成されるObservableは 1、2、3 という値を次々に生起します。生成オペレーターについては後のセクションで詳しく論じます。

〔オペレーター全般の説明に話を戻しましょう。〕
例えば、[`map`](/api/operators/map)というオペレーターは配列に備わった同名のメソッドと類似の働きをします。ちょうど配列に対する処理 `[1, 2, 3].map(x => x * x)` というコードが `[1, 4, 9]` という結果値を生成するのと同様に、mapオペレーターによりマッピングされた値を配信する新しいObservableが生成されます:

```ts
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

of(1, 2, 3)
  .pipe(map((x) => x * x))
  .subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
// value: 4
// value: 9
```

このObservableは `1`、`4`、`9`という値を生成します。もう1つ便利なオペレーター [`first`](/api/operators/first) をご紹介しましょう:

```ts
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

of(1, 2, 3)
  .pipe(first())
  .subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
```

この例で注意していただきたいのは、 `map` オペレーターの場合マッピング関数を指定しないとならないのでその都度 `map(......)` という関数呼び出しを行ってオペレーターのインスタンスを構築している点です。これとは対象的に `first` オペレーターの場合は定数化して都度 `first()` という関数呼び出しをせずに済むようにすることも可能なのですが、にもかかわらずやはり `first()` 呼び出しを行っています。その構築に引数が必要であるかないかに関わらず、すべてのオペレーターは関数呼び出しにより生成するのが慣例となっています。

## パイプ処理

パイプ可能オペレーターは関数なので、それらを `op()(observer)` のように通常の関数として使用することも _できる_ のですが、実際にそれを行うと呼び出しの入れ子が深くなりがちで、すぐさま `op4()(op3()(op2()(op1()(observer))))` のような可読性の低いコードになってしまいます。
このため、Observableは `.pipe()` というメソッドを提供しています。このメソッドは先程の関数呼び出しと同じことをより可読性の高いコードで実現できるようにしてくれています：

```ts
observer.pipe(op1(), op2(), op3(), op4());
```

コーディング・スタイルとして、たとえ単一のオペレーターしかない場合でも `op()(observer)` の形式はとらず、 `observer.pipe(op())` の形式をとることが、一般に好ましいものとされています。

## 生成オペレーター

**生成オペレーターとは何者でしょうか？** パイプ可能オペレーターと違い、生成オペレーターはいくつかのお決まりの挙動を示すObservableや、複数のObservableを連結した新たなObservableを生成するのに使用します。

生成オペレーターの典型的な例は `interval` 関数です。この関数は引数として（Observableではなく）数値をとり、Observableを生成して返します：

```ts
import { interval } from 'rxjs';

const observable = interval(1000 /* ミリ秒 */);
```

すべての生成オペレーターの一覧は [こちら](#creation-operators-list) にあります。

## 高階Observable

Observableはふつう文字列や数値のシーケンスを生み出します。ところで意外に思われるかもしれませんが、しばしば Observable _の_ Observable 〔Observableのシーケンスを生み出すObservable〕を処理することが必要になります。このようなObservableのことを高階Observableと呼びます。
例えば、文字列のシーケンスを生み出すObservableがあったとしましょう。その文字列はファイルを指すURLで、あなたはそのファイルの内容を参照する必要があります。コードは次のようになるでしょう：

```ts
const fileObservable = urlObservable.pipe(map((url) => http.get(url)));
```
`http.get()` は個々のURLについて、文字列ないし文字列の配列を生み出すObservableを返します。
かくして、あなたは Observable _の_ Observable、つまり高階Observableを手に入れました。

高階Observableを処理するにははどうしたらよいのでしょうか？　一般的には _平坦化_ を行います。つまり、どうにかして高階ObservableをただのObservableに変換するのです。例えば：

```ts
const fileObservable = urlObservable.pipe(
  map((url) => http.get(url)),
  concatAll()
);
```

[`concatAll()`](/api/operators/concatAll) オペレーターは "外側の" Observableから生成される "内側の" Observableを1つずつ購読していきます。 1つ目の "内側の" Observableが生成する値をすべて読み取ってコピーしら、2つ目の "内側の" Observableに取り掛かります。すべての値は連結されます。他の便利な _平坦化_ のオペレーターには次のようなものがあります（これらは [_結合オペレーター_](#join-operators) と呼ばれています）：

- [`mergeAll()`](/api/operators/mergeAll) — 内側のObservableを受信する都度それを購読し、それらのObservableから値を受信する都度それを自身の購読者に向けて送信します。〔複数のObservableを並行的に購読し、それらから生成される値のシーケンスを、単一のシーケンスに統合します。〕
- [`switchAll()`](/api/operators/switchAll) — 1つ目の内側のObservableを受信するとそれを購読し、そのObservableから値を受信する都度それを自身の購読者に向けて送信します。しかし2つ目の内側のObservableを受信すると1つ目のObservableの購読を取りやめます。そして新しいObservableを購読します。
- [`exhaustAll()`](/api/operators/exhaustAll) — 
1つ目の内側のObservableを受信するとそれを購読し、そのObservableから値を受信する都度それを自身の購読者に向けて送信します。処理中の内側のObservableが完了するまでの間は新たな内側のObservableは受信しても破棄します。完了したら次の内側のObservableの到着を待機します。

多くの配列処理ライブラリーが [`map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) と [`flat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) （ないし `flatten()` ）を結びつけた [`flatMap()`] を提供しているのと同じように、RxJSのすべての平坦化オペレーターのマッピング版が存在します。 [`concatMap()`](/api/operators/concatMap)と [`mergeMap()`](/api/operators/mergeMap)、 [`switchMap()`](/api/operators/switchMap)と [`exhaustMap()`](/api/operators/exhaustMap)がそれです。

## マーブル・ダイアグラム

オペレーターがどのように機能するかを説明するのに、文章による説明は不十分であることがしばしばです。多くのオペレーターの動作は時間経過と関係しており、例えば、遅延、値の取捨選択、流速の調節、それからデバウンス〔負荷軽減や誤作動抑止のため、短時間に高頻度に起こる値の発生を1つの値の発生にまとめること〕について、各オペレーターはそれぞれのやり方を持っています。
これらを説明する上でダイアグラムはしばしば有用なツールとなります。 _マーブル・ダイアグラム_ はオペレーターがどのように機能するかを視覚的に表現したものです。図中には入力となるObservable、オペレーターとそのパラメーター、そして出力となるObservableが示されています。

<span class="informal">マーブル・ダイアグラムの中では、時間は右方向に流れ、Observableの実行に伴ってどのように値（これが "マーブル"、ビー玉です）が生成されるかが示されます。</span>

以下の図によってマーブル・ダイアグラムの構造を理解できるでしょう。

<img src="../../src/assets/images/guide/marble-diagram-anatomy.svg">

〔左上〕左から右に進む時間の流れ。オペレーターの入力となるObservableの実行を表す。
〔中央上〕Observableにより生成される値。
〔右上〕垂直線は完了の通知と、Observableが正常に終了したことを示す。
〔右中〕矩形はオペレーターを表す。オペレーターは上段に記述されたObservableを入力に取り、下段に記述されたObservableを出力する。矩形の内側のテキストはデータ変換の性質を示す。
〔左下〕オペレーターの出力となるObservable。
〔中央下〕Xはエラーの通知と、Observableが異常終了したことを示す。これ以降いかなる値の生成も通知も行われない。

このドキュメントの中ではオペレーターの動き方を説明するため多くのマーブル・ダイアグラムを用います。これらの図は他の文脈、例えばホワイトボードに書いたりできるのはもちろん（ASCIIダイアグラムの形で）単体テストの中でも活用できます。

## Categories of operators

There are operators for different purposes, and they may be categorized as: creation, transformation, filtering, joining, multicasting, error handling, utility, etc. In the following list you will find all the operators organized in categories.

For a complete overview, see the [references page](/api).

### <a id="creation-operators-list"></a>Creation Operators

- [`ajax`](/api/ajax/ajax)
- [`bindCallback`](/api/index/function/bindCallback)
- [`bindNodeCallback`](/api/index/function/bindNodeCallback)
- [`defer`](/api/index/function/defer)
- [`empty`](/api/index/function/empty)
- [`from`](/api/index/function/from)
- [`fromEvent`](/api/index/function/fromEvent)
- [`fromEventPattern`](/api/index/function/fromEventPattern)
- [`generate`](/api/index/function/generate)
- [`interval`](/api/index/function/interval)
- [`of`](/api/index/function/of)
- [`range`](/api/index/function/range)
- [`throwError`](/api/index/function/throwError)
- [`timer`](/api/index/function/timer)
- [`iif`](/api/index/function/iif)

### <a id="join-creation-operators"></a>Join Creation Operators

These are Observable creation operators that also have join functionality -- emitting values of multiple source Observables.

- [`combineLatest`](/api/index/function/combineLatest)
- [`concat`](/api/index/function/concat)
- [`forkJoin`](/api/index/function/forkJoin)
- [`merge`](/api/index/function/merge)
- [`partition`](/api/index/function/partition)
- [`race`](/api/index/function/race)
- [`zip`](/api/index/function/zip)

### Transformation Operators

- [`buffer`](/api/operators/buffer)
- [`bufferCount`](/api/operators/bufferCount)
- [`bufferTime`](/api/operators/bufferTime)
- [`bufferToggle`](/api/operators/bufferToggle)
- [`bufferWhen`](/api/operators/bufferWhen)
- [`concatMap`](/api/operators/concatMap)
- [`concatMapTo`](/api/operators/concatMapTo)
- [`exhaust`](/api/operators/exhaust)
- [`exhaustMap`](/api/operators/exhaustMap)
- [`expand`](/api/operators/expand)
- [`groupBy`](/api/operators/groupBy)
- [`map`](/api/operators/map)
- [`mapTo`](/api/operators/mapTo)
- [`mergeMap`](/api/operators/mergeMap)
- [`mergeMapTo`](/api/operators/mergeMapTo)
- [`mergeScan`](/api/operators/mergeScan)
- [`pairwise`](/api/operators/pairwise)
- [`partition`](/api/operators/partition)
- [`pluck`](/api/operators/pluck)
- [`scan`](/api/operators/scan)
- [`switchScan`](/api/operators/switchScan)
- [`switchMap`](/api/operators/switchMap)
- [`switchMapTo`](/api/operators/switchMapTo)
- [`window`](/api/operators/window)
- [`windowCount`](/api/operators/windowCount)
- [`windowTime`](/api/operators/windowTime)
- [`windowToggle`](/api/operators/windowToggle)
- [`windowWhen`](/api/operators/windowWhen)

### Filtering Operators

- [`audit`](/api/operators/audit)
- [`auditTime`](/api/operators/auditTime)
- [`debounce`](/api/operators/debounce)
- [`debounceTime`](/api/operators/debounceTime)
- [`distinct`](/api/operators/distinct)
- [`distinctUntilChanged`](/api/operators/distinctUntilChanged)
- [`distinctUntilKeyChanged`](/api/operators/distinctUntilKeyChanged)
- [`elementAt`](/api/operators/elementAt)
- [`filter`](/api/operators/filter)
- [`first`](/api/operators/first)
- [`ignoreElements`](/api/operators/ignoreElements)
- [`last`](/api/operators/last)
- [`sample`](/api/operators/sample)
- [`sampleTime`](/api/operators/sampleTime)
- [`single`](/api/operators/single)
- [`skip`](/api/operators/skip)
- [`skipLast`](/api/operators/skipLast)
- [`skipUntil`](/api/operators/skipUntil)
- [`skipWhile`](/api/operators/skipWhile)
- [`take`](/api/operators/take)
- [`takeLast`](/api/operators/takeLast)
- [`takeUntil`](/api/operators/takeUntil)
- [`takeWhile`](/api/operators/takeWhile)
- [`throttle`](/api/operators/throttle)
- [`throttleTime`](/api/operators/throttleTime)

### <a id="join-operators"></a>Join Operators

Also see the [Join Creation Operators](#join-creation-operators) section above.

- [`combineLatestAll`](/api/operators/combineLatestAll)
- [`concatAll`](/api/operators/concatAll)
- [`exhaustAll`](/api/operators/exhaustAll)
- [`mergeAll`](/api/operators/mergeAll)
- [`switchAll`](/api/operators/switchAll)
- [`startWith`](/api/operators/startWith)
- [`withLatestFrom`](/api/operators/withLatestFrom)

### Multicasting Operators

- [`multicast`](/api/operators/multicast)
- [`publish`](/api/operators/publish)
- [`publishBehavior`](/api/operators/publishBehavior)
- [`publishLast`](/api/operators/publishLast)
- [`publishReplay`](/api/operators/publishReplay)
- [`share`](/api/operators/share)

### Error Handling Operators

- [`catchError`](/api/operators/catchError)
- [`retry`](/api/operators/retry)
- [`retryWhen`](/api/operators/retryWhen)

### Utility Operators

- [`tap`](/api/operators/tap)
- [`delay`](/api/operators/delay)
- [`delayWhen`](/api/operators/delayWhen)
- [`dematerialize`](/api/operators/dematerialize)
- [`materialize`](/api/operators/materialize)
- [`observeOn`](/api/operators/observeOn)
- [`subscribeOn`](/api/operators/subscribeOn)
- [`timeInterval`](/api/operators/timeInterval)
- [`timestamp`](/api/operators/timestamp)
- [`timeout`](/api/operators/timeout)
- [`timeoutWith`](/api/operators/timeoutWith)
- [`toArray`](/api/operators/toArray)

### Conditional and Boolean Operators

- [`defaultIfEmpty`](/api/operators/defaultIfEmpty)
- [`every`](/api/operators/every)
- [`find`](/api/operators/find)
- [`findIndex`](/api/operators/findIndex)
- [`isEmpty`](/api/operators/isEmpty)

### Mathematical and Aggregate Operators

- [`count`](/api/operators/count)
- [`max`](/api/operators/max)
- [`min`](/api/operators/min)
- [`reduce`](/api/operators/reduce)

## Creating custom operators

### Use the `pipe()` function to make new operators

If there is a commonly used sequence of operators in your code, use the `pipe()` function to extract the sequence into a new operator. Even if a sequence is not that common, breaking it out into a single operator can improve readability.

For example, you could make a function that discarded odd values and doubled even values like this:

```ts
import { pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

function discardOddDoubleEven() {
  return pipe(
    filter((v) => !(v % 2)),
    map((v) => v + v)
  );
}
```

(The `pipe()` function is analogous to, but not the same thing as, the `.pipe()` method on an Observable.)

### Creating new operators from scratch

It is more complicated, but if you have to write an operator that cannot be made from a combination of existing operators (a rare occurrance), you can write an operator from scratch using the Observable constructor, like this:

```ts
import { Observable, of } from 'rxjs';

function delay<T>(delayInMillis: number) {
  return (observable: Observable<T>) =>
    new Observable<T>((subscriber) => {
      // this function will be called each time this
      // Observable is subscribed to.
      const allTimerIDs = new Set();
      let hasCompleted = false;
      const subscription = observable.subscribe({
        next(value) {
          // Start a timer to delay the next value
          // from being pushed.
          const timerID = setTimeout(() => {
            subscriber.next(value);
            // after we push the value, we need to clean up the timer timerID
            allTimerIDs.delete(timerID);
            // If the source has completed, and there are no more timers running,
            // we can complete the resulting observable.
            if (hasCompleted && allTimerIDs.size === 0) {
              subscriber.complete();
            }
          }, delayInMillis);

          allTimerIDs.add(timerID);
        },
        error(err) {
          // We need to make sure we're propagating our errors through.
          subscriber.error(err);
        },
        complete() {
          hasCompleted = true;
          // If we still have timers running, we don't want to yet.
          if (allTimerIDs.size === 0) {
            subscriber.complete();
          }
        },
      });

      // Return the teardown logic. This will be invoked when
      // the result errors, completes, or is unsubscribed.
      return () => {
        subscription.unsubscribe();
        // Clean up our timers.
        for (const timerID of allTimerIDs) {
          clearTimeout(timerID);
        }
      };
    });
}

// Try it out!
of(1, 2, 3).pipe(delay(1000)).subscribe(console.log);
```

Note that you must

1. implement all three Observer functions, `next()`, `error()`, and `complete()` when subscribing to the input Observable.
2. implement a "teardown" function that cleans up when the Observable completes (in this case by unsubscribing and clearing any pending timeouts).
3. return that teardown function from the function passed to the Observable constructor.

Of course, this is only an example; the [`delay()`](/api/operators/delay) operator already exists.
