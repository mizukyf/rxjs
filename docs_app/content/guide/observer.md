# Observer

**Observerとは何者でしょうか？** ObserverはObservableから配信されるデータの消費者です。
ObserverはObservableから配信される 通知の各タイプ── `next`、`error`、`complete`──のそれぞれに対応するコールバック関数のセットです。
次に示すのは典型的なObserverオブジェクトの定義の例です：

```ts
const observer = {
  next: x => console.log('Observerが次の値を取得: ' + x),
  error: err => console.error('Observerがエラーを取得: ' + err),
  complete: () => console.log('Observerが完了の通知を取得'),
};
```

こうして定義したObserverを使用するには、それをObservableの `subscribe` メソッドに与えます：

```ts
observable.subscribe(observer);
```

<span class="informal">Observerは3つのコールバック関数を持つオブジェクトに過ぎません。コールバック関数のそれぞれはObservableが配信する可能性のある3つのタイプの通知のそれぞれに対応するものです。</span>

RxJSにおいてはObserverは *一部分だけ* のものでも構いません。コールバック関数のうち1つを提供しなかったとしても、Observableは普通に実行されます。Observerが提供しなかったコールバック関数に対応する通知が無視されるだけです。

次のコードは `complete` 通知に対応するコールバック関数が省略された `Observer` の例です:

```ts
const observer = {
  next: x => console.log('Observerが次の値を取得: ' + x),
  error: err => console.error('Observerがエラーを取得: ' + err),
};
```

`Observable` を購読するとき、`next` 通知に対応するコールバック関数だけを引数として渡すこともできます。`Observer` オブジェクトに関連付けされていない、単なる一個の関数を渡すということです。例えば次のように：

```ts
observable.subscribe(x => console.log('Observer got a next value: ' + x));
```

`observable.subscribe` メソッドの内部では、引数で渡された`next` のコールバック関数を用いて `Observer` オブジェクトが生成されます。