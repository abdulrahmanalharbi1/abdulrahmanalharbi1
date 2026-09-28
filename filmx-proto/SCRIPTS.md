# FILMX — final scripts (Saudi dialect, male VO "Ken", ElevenLabs via Higgsfield)

Sources: `filmx-ref/research/verified_facts.json` (re-verified live on filmx.capital, 2026-09-28).
Brand rules applied: no prices, ranges or "starts from"; XPEL named first; no XPEL authorization or
10-year claims (FILMX is not on Zan Arabia's authorized-installer list — pending client confirmation);
Ravoony only as «أفلام Ravoony الأصلية»; no instalment or e-payment mentions; the 7-day refund is conditional,
so it is not claimed; the pledge is scoped to «ركّبناها» (film installed at FILMX).
TTS input with phonetic spellings: `assets/vo/lines.json`; word timings (Whisper): `assets/vo/words.json`.

## V3 — «تعهّد FILMX» (32.3 s) · `protos/v3.js`

| VO | On screen |
|---|---|
| قبل ما تركّب حماية لسيارتك… | typewriter «قبل ما تركّب / حماية لسيارتك…» (the one still frame) |
| اسأل سؤال واحد بس: | hard cut · «اسأل» + grey «سؤال واحد» · magnifier |
| وش يصير لو تضررت قطعة؟ | rack · grey «وش يصير» + «لو تضررت قطعة؟» · panel gets scratched |
| في فيلم إكس… أي قطعة PPF ركّبناها وتضررت، نستبدلها لك مجاناً. | whip · «تعهّد FILMX» + pills «أي قطعة PPF ركّبناها وتضررت…» / «نستبدلها لك مجاناً» · shield |
| لأي سبب كان… بلا شروط. | pill «لأي سبب كان · بلا شروط» |
| وطول مدة ضمان فيلم إكس… بلا حدّ لعدد القطع. | pill «طوال مدة ضمان FILMX · بلا حدّ لعدد القطع» |
| وضمان فيلم إكس مسجّل برقم سيارتك. | rack · «ضمان FILMX» + grey «مسجّل» + «برقم سيارتك» · black card, engraved |
| فيلم إكس… حيث تُصان الفخامة بصمت. احجز موعدك على الواتساب. | gold burn → dark end card: FILMX, tagline, «احجز موعدك عبر واتساب», 055 375 4507, @filmx.sa · filmx.capital |

## V4 — «الأصلي من المغشوش» (94.9 s) · `protos/v4.js`

| Act | VO | On screen |
|---|---|---|
| Hook | أغلب سوالف الحماية… تبدأ من هنا: | presenter column (silhouette = slot for the client's photo) |
| Status quo | السعر… اللمعة… السرعة. | rack montage: tag / glossy tile / stopwatch |
| Pivot | بس قبل ما تركّب… | typewriter, still frame |
| Framework | فيه أربع أشياء لازم تكون واضحة. | grey «٤ أشياء» + badges ١–٤ (السماكة · الخدش · اللون · الضمان) |
| 1 | أول شي السماكة: الفيلم الأصلي سماكته وحدة… من طرفه لطرفه. | cross-sections: even (genuine) vs wavy (fake) + gauges · micrometer |
| 2 | ثاني شي الخدش السطحي: الفيلم الأصلي يصلّح نفسه… صبّ عليه موية حارة ويختفي تلقائياً. | two panels, one scratch, hot-water drop heals the genuine one |
| 3 | ثالث شي اللون: المغشوش ممكن يبان مقبول أول يوم… بس غالباً يصفرّ ويتقلّص خلال سنة ولا سنتين. | white paint swatch yellows + shrinks along «أول يوم → سنة → سنتين» |
| 4 | رابع شي الضمان: مكتوب ومسجّل برقم سيارتك؟ ولا مجرد كلام؟ | engraved card «ضمان مكتوب» vs speech bubble that dissolves, struck «مجرد كلام» |
| Proof | في فيلم إكس الجواب واضح: | whip · «في FILMX» + grey «الجواب واضح» · car |
| Brands | نركّب XPEL… وأفلام Ravoony الأصلية. | pills XPEL / «أفلام Ravoony الأصلية» · film roll |
| Packages | والحماية بأربع باقات تغطية كاملة: لمعان ٧٫٥، ٨٫٥، ١٠ مل… ومطفّي ٧٫٥. | grey «٤ باقات» + four rows with film cross-sections |
| Pledge | وأي قطعة PPF ركّبناها وتضررت… نستبدلها لك مجاناً. لأي سبب كان، طول مدة ضمان فيلم إكس، وبلا حدّ لعدد القطع. | «تعهّد FILMX» + five gold pills · shield |
| Extras | وضمان فيلم إكس مسجّل برقم سيارتك… وجودة التركيب مضمونة ثلاثين يوم… وننقل سيارتك مجاناً داخل الرياض. | card · wax seal «٣٠ يوماً» · car transporter |
| Services | وغير الحماية، عندنا: تظليل وعزل حراري، نانو سيراميك، تلميع وتصحيح طلاء، عناية تفصيلية، ستيكرات مخصصة، ودهان كاليبر. | rack montage, one object per service, progress dots |
| CTA | فيلم إكس… دار حماية السيارات الفاخرة في الرياض، بالموعد فقط. احجز على الواتساب. | gold burn → end card: tagline, «بالموعد فقط», WhatsApp 055 375 4507, @filmx.sa · filmx.capital, حي الياسمين · الرياض |

Cut for length (target 90 s) and compliance: the stakes line («بدون هالأجوبة… يعطيك لمعة مؤقتة»),
the "ask any centre" line, and the conditional 7-day refund.
