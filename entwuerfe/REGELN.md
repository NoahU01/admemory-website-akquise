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
