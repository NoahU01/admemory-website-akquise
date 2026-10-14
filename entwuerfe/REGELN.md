# Regelwerk für Entwürfe

Aus Noahs Durchsicht des ersten Nachbaus (Roll Truckservice, 10.10.2026).
Diese Regeln gelten branchenübergreifend, sofern nichts anderes dabeisteht.
Der Agent hält sie ein; der Torwächter prüft, was prüfbar ist.

---

## Texte

**Keine Gedankenstriche.** Kein `—`, kein `--`, kein ` - ` als Einschub. Das
liest sich nach maschinell erzeugtem Text und fällt sofort auf. Stattdessen
zwei Sätze, ein Doppelpunkt oder ein Komma.

**Die Vorzeile über der Überschrift sagt, was der Betrieb macht.** Nicht Ort
und Gründungsjahr. „Crailsheim · seit 1876" war falsch; richtig wäre
„Werkstatt & Notdienst für Nutzfahrzeuge". Kurz halten. Die Region kommt
dazu, wenn sie noch hineinpasst, sonst steht sie im Fließtext darunter.

Daraus folgt für den Agenten: Er muss das **Kerngeschäft** benennen können,
bevor er die Seite baut. Das gehört in `daten.json` als eigenes Feld, belegt.

**Der Fließtext unter der Überschrift ist kleiner als bisher** und nicht grau.
Lesbarer Fließtext, nicht ein zweites, blasses Überschriftenformat.

## Maße

**Überschriften dürfen größer sein**, besonders die der Startseite.

**Zwischen Vorzeile und Überschrift gehört wenig Abstand.** Sie sind eine
Einheit, keine zwei Blöcke.

## Bilder

**Groß einsetzen.** Kleine Bilder in schmalen Spalten wirken wie ein
Baukasten aus den Zehnerjahren. Wenn ein Bild etwas zeigt, soll es wirken.

**Das Logo des Betriebs gehört immer auf die Seite**, und zwar das echte, nicht
ein nachgebautes oder der ausgeschriebene Name. Es wird mit den übrigen
Bildern geholt.

**Vertragspartner und Marken immer als Logo**, nie als Textpille. Pillen mit
Markennamen wirken billig. Branchenübergreifend.

## Navigation

**Die Punkte stehen rechts**, nicht links.

**Die Navigation bildet die des Originals ab**, auch wenn nur eine Unterseite
gebaut wird. Links auf nicht gebaute Seiten dürfen ins Leere gehen. Der
Betrieb soll seine eigene Seite wiedererkennen.

## Bausteine

**Hover-Zustände gehören dazu.** Karten heben sich leicht an oder wachsen
etwas, wenn der Zeiger darüber steht.

**Icons minimalistisch**, im selben Strichstil über die ganze Seite.

**Ein Baustein darf hervorgehoben sein.** Bei Roll Truckservice ist die
Notdienst-Karte rot, die übrigen neutral. Das bringt Gestaltung in ein
Raster, das sonst gleichförmig wirkt.

**Vertrauenselemente gehören hinein, wo es sie gibt** — Auszeichnungen,
Partnerschaften, Jahre am Markt, Bewertungen. Sie müssen gut aussehen, nicht
nur vorhanden sein.

**Sticky-Element am Rand**, wenn es einen Grund gibt: Notdienst, Rückruf,
Terminbuchung. Es fährt mit, macht auf sich aufmerksam und klappt beim
Überfahren auf. Nicht überall sinnvoll, aber dort, wo ein Anruf das Ziel ist.

## Farben und Kontrast

**Textfarben richten sich nach dem Untergrund, nicht nach der Klasse.** Im
ersten Entwurf stand im Fußbereich fast schwarzer Text auf schwarzem Grund,
Kontrast 2,4:1 statt der nötigen 4,5:1 — weil `.klein` eine Farbe für helle
Flächen benutzte und der Fußbereich die dunkle Umgebung nicht angemeldet
hatte.

## Was der Torwächter davon prüft

| Regel | prüfbar |
|---|---|
| Keine Gedankenstriche im Text | ja |
| Kontrast überall mindestens 4,5:1 | ja |
| Logo vorhanden | ja |
| Navigation entspricht dem Original | ja, über die Zahl der Punkte |
| Bilder nicht zu klein dargestellt | ja, über die Anzeigefläche |
| Vorzeile nennt das Kerngeschäft | nein, das beurteilt Claude |
| Wirkt die Seite modern | nein, das beurteilt Claude |

## Keine zweite Markenfarbe erfinden

Die Akzentfarbe kommt von der Originalseite. Gibt es dort nur eine, bleibt es
bei einer. Eine zweite zu raten heißt, dem Betrieb eine Farbe anzudichten, die
er nicht hat — und beim Pitch fällt genau das auf.

## Kundenstimmen werden nicht umgeschrieben

Was in einer Google-Bewertung steht, steht so auf der Seite. Keine Kürzung auf
Werbelänge, keine Glättung. Eine Bewertung mit vier Sternen und einem Einwand
wirkt echter als fünf makellose.

## Sterne nur, wenn es eine Note gibt

Weder im Vertrauens-Modul noch bei den Stimmen werden Sterne geraten. Ohne
Note steht die Zahl der Bewertungen allein. Wo die Note fehlt, holt
`sterne-nachholen.mjs` sie bei Google nach — und übernimmt sie nur, wenn der
Hostname der gefundenen Website zu unserem passt.

## Kundenstimmen erst ab drei

Unter drei Stimmen wird kein Kundenstimmen-Modul gebaut. Zwei Karten
nebeneinander sehen nicht nach Zuspruch aus, sondern nach Mangel, und ein
laufendes Band aus zwei Karten wiederholt sich sichtbar. Die Bausteine
brechen ab, statt etwas Schwaches zu bauen.

## Zu lange Bewertungen werden gekürzt

Am Satzende, mit Auslassungszeichen. Das ist etwas anderes als Einträge
wegzulassen: Keine Stimme fällt weg, nur ihr Ende. Umgeschrieben wird nie.

## Keine Vorzeile in jedem Modul

Die kleine Zeile über der Überschrift gehört nicht in jedes Modul. Sie
bekommt eine eigene Kategorie. Wo sie steht, nennt sie das Kerngeschäft —
aber sie steht nicht überall.

## Beispielbilder in der Bibliothek

Als Platzhalter-Porträt kommt Noahs eigenes Bild von admemory.de hinein.
Fremde Gesichter nicht, auch nicht die anderen Porträts auf derselben Seite.
Dasselbe Bild für alle Stimmen macht außerdem sofort klar, dass es ein
Beispiel ist.

## Vor jedem neuen Modul: Varianten ankündigen

Bevor gebaut wird, bekommt Noah die geplanten Fassungen als kurze Liste.
Dann kann er vorher Feedback geben, statt hinterher.

## Logoleisten sitzen auf Navigationsbreite

Eine Logoleiste unter dem Kopfbereich ist bündig mit dem Inhalt der
Navigation — auch dann, wenn der Entwurf noch keine Navigation hat. Sonst
springt die Kante, sobald eine dazukommt. Sie läuft, und sie braucht
mindestens acht Logos; sind weniger da, wird die Liste wiederholt.

## Beispielbilder sind CC0

Freie Bilder für die Bibliothek kommen über `bilder-holen.mjs` aus
Openverse, ausschließlich CC0. Bei CC-BY müsste auf jeder Seite eine
Namensnennung stehen, die in einem Entwurf nichts zu suchen hat. Herkunft,
Urheber und Lizenz stehen trotzdem in `beispiel-bilder/herkunft.json` —
nicht weil die Lizenz es verlangt, sondern damit nachvollziehbar bleibt,
woher ein Bild kam.

## Streufeld: fünf bis vierundzwanzig Logos

Darunter ist es mehr Lücke als Inhalt, darüber eine Wand — dafür gibt es
die Logowand. Das Feld wächst mit der Anzahl, aber nicht endlos.
