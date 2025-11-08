# アグリテクニカ2025
40周年なんすね。

2025年は11月9日-15日に例年通りハノーファー・メッセで開催。
[DLGのHP](https://www.dlg.org/en/detail/-dlg-agrifuture-concept-winners-2025-announced-visionary-ideas-in-agricultural-technology-recognized)などを参考に情報収集。

## 注意点(N氏)
- ブースでお酒飲みすぎると全部回りきれなくなるのでほどほどに...

## 勝手にまとめ(参加しないのに)
- Amazone が技術としては抜きん出てる感じ。面白い。
- ロボットは今回も結構多そう。Nexat を始めとして、新しい農業の形を実現する機械も多数展示。
- 中国の機械が結構多そう。Zoomlion を始めとして、今後の世界の農業機械市場を変えるかも。
- 日本の機械もKubotaを筆頭として、ロボット農機を展示

## 写真 

は、適宜クレジット付きで載せていく予定.
## [AEF](https://digital.agritechnica.com/newfront/exhibitor/aef---agricultural-industry-electronics-foundation-ev)

Plugfest でおなじみのAEFの、FieldDataSync という機械間の無線通信技術が面白い。
[Field machine sync](https://www.aef-online.org/aef-news/fielddatasync-shortlisted-for-dlg-agrifuture-concept-winner-2025.html)

Deere とかでもMachine Sync とかでカートとコンバインの協調ができるように、メーカー依存のコミュニケーションシステムは存在していたけど、メーカーに依存しないシステムとしてはこれが初か。

AEFが、というよりかはTUMとかAGCOとかのグループで、Fereral Ministry of Agriculture, Foodがマネージして作ったシステムらしい。

北大で協調ロボット作ったけど、あれはローカルLANとか5Gだった。
通信の方法が気になるのと、どうやって通信した結果をトラクタのCANに潜り込ませているのか、そこのアーキテクチャが気になる。

ともあれ、こういうのが市販化されるとトラクタ・ハーベスタにレトロフィットで乗っかるとカートの人たちも便利になるし、溢れさせてさあ大変ということもなさそう。

## [Amazone](https://digital.agritechnica.com/newfront/exhibitor/amazonen-werke--h-dreyer-se--co-kg)

今回もめちゃくちゃ気合入ってると思う。

ソフト、ハードともに結構アップデートされてる。
[公式の紹介](https://amazone.net/en/agritechnica/agritechnica-2025-innovations/categories/highlights)
    
- [ZA-TS 01: 肥料粒体の散布速度もセンシング](https://amazone.net/en/agritechnica/agritechnica-2025-innovations/innovation-details/amazone-za-ts-01-autospread-2064660)

ZA-TSではできてた散布方向のモニタリングだけではなくて、散布速度が加わることで、実際の飛距離の推定が可能になりそう。
より高精度なバウンダリーコントロールができるかも

- [Soil Detect: soil conductivity(土壌の電気伝導率) measurting while tilling](https://amazone.net/en/agritechnica/agritechnica-2025-innovations/innovation-details/the-soil-leads-to-success-2061782)

耕しながら土壌の電気伝導率をセンシングできる。日本だとECと呼ばれているもの(soil electrical conductibity, EC)。

[soil quality indicators](https://www.nrcs.usda.gov/sites/default/files/2022-10/Soil%20Electrical%20Conductivity.pdf)

ECマップを作成して、ドローンや人工衛星などのデータと組み合わせて、適切な施肥計画が得られる。

まあNDVIだけでいいんじゃねって思うけど、結局ECベースで土質がわからんと適切な肥料の種類や散布量が決まらないから、土を見るのはたいせつ。

前回もあったけど、チゼルの深さや抵抗を測定して、トラクタの情報を合わせて土壌マップ作る取り組みの延長に有る技術かも。

- [EasyTram: トラムラインだけ播種しない技術](https://amazone.net/en/agritechnica/agritechnica-2025-innovations/innovation-details/easytram-tramlining-via-application-maps-2063346)

まあ実現できるような、でも今までなかった技術。
結局トラムラインに植えるものって無駄だから、種代節約しましょうという話。
CTFの流行りも受けての技術かも。

- [weed detector: 牧草刈取時に雑草をセンシングしてスポットスプレーしましょう](https://amazone.net/en/agritechnica/agritechnica-2025-innovations/innovation-details/weed-detector-for-spot-application-in-grassland-2066018)

なぜかトラクタにモザイクが笑 
どんなメーカーでもできるよってことかもしれないけど。

これも単純なアイディアだけど、まああまりやらなかったものだ。
claas のdisco にデプスカメラみたいなのつけてるけど、これで雑草の種類を特定するのだろう。

amazone のスポットスプレー技術が合わさることで実現できるもの。


## [APV](https://digital.agritechnica.com/newfront/exhibitor/apv---technische-produkte-gmbh)

なにかおもしろい展示してくれないかなぁ。

[何かしらのsolutionがあると面白いかも](https://www.apv.at/agritechnica-2025)

## [AgXeed](https://digital.agritechnica.com/newfront/marketplace/exhibitors?pageNumber=45&limit=60G)

最近良く目にするロボット。
クローラで牽引力もあって、tillage をよくデモでやってるイメージ。
小型なのによく牽けたら、いいよね。

T2, W3, W4 と何種類か展示するみたい。

## [Bednar](https://digital.agritechnica.com/newfront/exhibitor/bednar-fmt-sro)

[Directo ne](https://www.bednar.com/en/blog/bednar-at-agritechnica-2025-experience-smart-innovations-in-yellow-and-black/)
はおもしろそう。

スペードブレードローラーは持ってこないのか。あれってclaydonだっけ。

## [Claas](https://digital.agritechnica.com/newfront/exhibitor/claas-95d9d2c8)

トラクタのデザインが一新、400hp のaxion みたいなのも発表。
[公式](https://www.claas.com/de-de/erleben/stories/agritechnica)

クボタみたいな顔かも。

Jaguar 1200が良さそう。
スループットが改善されて、数年以内に日本にも入ってくると思われ。

ゼリオンも、トラックのものが展示されるみたいだ。
でもこれは前回展示されてたし、今回の目玉はトラクタと新型jaguar でしょう。

## [Claydon](https://digital.agritechnica.com/newfront/exhibitor/claydon)
スペードブレードローラーはこっちだったわ。
[claydon](https://claydondrill.com/)

terrastar 、hankmo との違いが気になるところ。

## [Daimler mercedes](https://digital.agritechnica.com/newfront/exhibitor/mercedes-benz-unimog-ahlborn-gmbh-nutzfahrzeuge)

[Unimog の新型がいくつか見れるみたい](https://special.mercedes-benz-trucks.com/en/special-trucks/fairs-and-events/agritechnica-2025.html)

UNI-TOUCHなるインテリアが使いやすいのだろうか。


## [Einbock](https://digital.agritechnica.com/newfront/exhibitor/einbck-gmbh-ff65cb95)
ウムラウト。

[einboeck](https://www.einboeck.at/)
日本にも入ってきつつ有るウィーダーだけど、オプションが豊富。なにか草抜きのヒントがあるかも。

Smart-hill なる画像ベースの列認識、列合わせが良いらしい。


## [Ermo](https://digital.agritechnica.com/newfront/marketplace/exhibitors?pageNumber=45&limit=60G)

イタリアンプラウ。
クソデカ混層耕ボトムプラウを持ってくるかも。


## [Fendt](https://digital.agritechnica.com/newfront/exhibitor/fendt---agco-gmbh)

ドイツの哲学。フェンㇳ。

電動なり、大型なり色々な新しいトラクタを出すようだ。

今回初登場は、
- [Xaver GT](https://www.youtube.com/watch?v=Ro3D9n5J5as)

ツールキャリアから始まるフェントの歴史が、新しく進化。まあありきたりっちゃありきたりなんだけど、トラクタで引っ張ってほ場まで移動、安全性もOK, 色々な既成の除草機を使えるという結構良さげな、実用に重きを置いた機械。


## [Geringhoff](https://digital.agritechnica.com/newfront/exhibitor/carl-geringhoff-vertriebsgesellschaft-mbh--co-kg-fc1b82da)

色々なヘッダーが出るはずだけど、シルバーの
[Yield eyeQ](https://www.geringhoff.com/en/YieldEyeQrow)
は面白いかも。

ヘッドロスを最小にするために、ヘッダーにカメラつけてロスをモニタリング

リール速度とか、エアー量を調節するのに役立てるみたい。

## [Grimme](https://digital.agritechnica.com/newfront/exhibitor/grimme-landmaschinenfabrik-gmbh--co-kg)

[気合入っている様子](https://grimme.com/en/agritechnica-2025)

ラダーフェブの交換がしやすくなってDLGシルバーだったけど、他にも色々おもしろい展示が有るはず。

芋以外の収穫機はヒントが多そう。
芋以外は、どちらかというと、
[Asa-lift](https://digital.agritechnica.com/newfront/marketplace/exhibitors?pageNumber=45&limit=60G) 
に展示が分散してそう。

## [Horizon](https://digital.agritechnica.com/newfront/marketplace/exhibitors?pageNumber=45&limit=60G)

Horizonも不耕起よくやってる。
プランタのクリーナーやドリルの播種ユニットが面白そう。

Sumo といいイギリス系の作業機って面白いよね。

## [Horsch](https://digital.agritechnica.com/newfront/exhibitor/horsch-maschinen-gmbh-193c5fb1)

北米での展開も順調に伸ばしているHorsch。
[機械をいっぱい持ってくるようだ](https://www.horsch.com/fileadmin/user_upload/terraHORSCH/Sonderausgabe_Agritechnica_2025/terraHORSCH_Sonderausgabe_2025_en.pdf)

由緒あるメーカーだが、最近はスプレーヤとプランタが北米では人気。

tillage tools も、独特なので面白そう。

## [John Deere](https://digital.agritechnica.com/newfront/exhibitor/john-deere-walldorf-international-gmbh)

今年のdeere はなにかおもしろいの有るかなぁ
[マップ](https://johndeere.widen.net/s/9wxwkx26xz/2601-internggational-stele-de#page=1)

あんまり目新しいのはないかもだけど、9RX 830が置いて有るらしいからそれは人気かも。

Deere のブースで1日溶けそうだ。

## [Kubota](https://digital.agritechnica.com/newfront/exhibitor/kubota-deutschland-gmbh-77dc58b6)

色々
[ロボット](https://www.kubota-group.eu/kubota-unveils-next-generation-smart-farming-solutions-at-agritechnica-2025/)
を展示するんですね。

クボタグループのソリューションハブ

- KFAST: vinyardスプレーヤロボット
- ROBOTTI: 畑作向けのぷらっとフォーム
- M7004 ロボット仕様: 普通のロボトラと同じだろうか。
- All terrain tractor: CES2025でベストイノベーションアワードらしい。

他に、farmworld TVとか見てて気になったやつは
- Aurea imaging のセンサ、ビンヤード向けのフェノタイピング用のセンサかな。
- 

## [Lemken](https://digital.agritechnica.com/newfront/exhibitor/lemken-gmbh--co-kg-c6876ee2)

あんまり目新しいのはないかだけど、ブロキャスがあるのは面白い。

## [Barnard Krone](https://digital.agritechnica.com/newfront/exhibitor/maschinenfabrik-bernard-krone-gmbh--co-kg-34aafaff)

Krone も気合入ってるはず。
リンクを貼ろうとしたけど、なぜかアクセスエラー(251102現在)


やっとアグリテクニカ開催してから
[アクセス](https://yourharvest.krone-agriculture.com/en/product-overview?utm_linktype=intern&utm_section=products&utm_string=Neuheiten_entdecken)
できるようになった。(1109午前4:30JST)

- RotoChop: 残幹処理チョッパー

まあぶっ叩いてるだけと言ってしまえばそうなのだが、地際ぎりぎり、というかなんなら土もぶっ叩いてる気がするのだが、動画を見る限りよく地面に追従してきれいに残幹を処理してくれている。

結構抵抗ありそうなのだが、ヘッダーはベルトPTO駆動なのだろうか。
駆動の伝達方法と馬力損失、そこが気になる。

Bigpack やロボット(Krone-Lemkenのやつ)も持ってくるようだ。

あと、なんだろう、見慣れない機械が動画では写ってる。
premos 的な新製品かな。
ひょっとしてpremos のフィーダーがちょっと変な感じかも。

Kroneの25周年ブラックビューティーはかっこいい。

## [Monosem](https://digital.agritechnica.com/newfront/exhibitor/monosem)

いろいろプランターを展示するはずで、

MS Electron

なる電動プランターは面白そう。

## [NEXAT](https://digital.agritechnica.com/newfront/exhibitor/nexat-gmbh)

CTFの権化。まあ人がいっぱいだろうけど、電動だし見どころは沢山有るはず。

[news](https://www.aginsights.blog/nexat-to-present-soybean-sowing-system-capable-of-planting-200-hectares-per-load-at-agritechnica-2025/)
そして、今回初公開の、プランター28m 幅、これまではガントリーの真ん中だけだったけど、左右にも展開してより幅広く、効率的に作業できるようになった。
ブラジルで稼働してるのかも、というやつが公開される。

## [Sumo](https://digital.agritechnica.com/newfront/exhibitor/sumo-uk-ltd)

ローラーが良い会社。
変なtillage tools.

## [SLSd]()

まあ
[変な機械たち](https://sls-systeme.de/#!/services)
を作ってる会社。

点滴灌漑用のパイプライン敷設・回収を機械化したらしく、すごいらしい。

パイプラインの場所ｗお勘tにするのにセンサーを使って、回収していくのかな。
[DripperSense](https://sls-systeme.de/wp-content/uploads/2023/11/SLS-DripperSense.pdf)

## [Vadastad](https://digital.agritechnica.com/newfront/exhibitor/vderstad-ab)

最近はHorshと競ってる感じがあるけど、tempo とcarrier は良い感じの機械たち。
レキサスツインがあればなぁ...

## [Zoomlion](https://digital.agritechnica.com/newfront/marketplace/exhibitors?pageNumber=45&limit=60G)

今後確実に世界を賑わすチャイナトラクタ。
中国の農業機械は確実に数年以内に世界に渡る。
無視は絶対にできない。

コンバインも出すようだ。

今回はRabe と手を組んで、Rabeの機械をzoomlion の色で出すみたいだ。

ハイブリッドトラクタを持ってくるかな。

## [Zurn](https://digital.agritechnica.com/newfront/marketplace/exhibitors?pageNumber=45&limit=60G)

[いろんな、変な収穫機](https://zuern-harvesting.de/)
を作ってる。

また、seed select なる、コンバインから出てくる雑草種子の低減ユニットを開発したらしい。
seed terminator みたいな、ハンマーミル構造ではなく、どうにかして、小さい抵抗で不活性化するらしい。

...どんな構造か、あまり情報が出てこない。
知財絡みかな。
