# Entwürfe

Nachgebaute Startseiten als Vorschau für die Akquise. Ein Unterordner je
Betrieb, erreichbar unter `entwuerfe.admemory.de/<betrieb>`.

## Warum alles in einem Projekt

Ein eigenes Repo und ein eigenes Vercel-Projekt je Entwurf wäre bei hundert
Seiten am Tag in einem Monat dreitausendmal dieselbe Einrichtung — und
dreitausend Gelegenheiten, das `noindex` zu vergessen. Hier steht es einmal in
`vercel.json` und gilt für jeden Entwurf, den der Agent ablegt. Vergessen ist
nicht möglich.

Der Preis dafür: Jeder neue Entwurf löst ein Deployment der ganzen Domain aus.
Bei statischen Dateien ist das schnell genug; wenn es bei einigen hundert
Entwürfen zäh wird, stellen wir auf einzelne Deployments um.

## Baukasten

`baukasten/` enthält die Gestaltungssprache und die Bausteine. Fest sind
Schrift, Farben, Abstände und Raster — dort entsteht der Unterschied zwischen
"wirkt professionell" und "wirkt zusammengewürfelt", und dort ist Zufall
teuer. Frei ist, welche Bausteine ein Entwurf verwendet, in welcher
Reihenfolge und mit welchem Inhalt.

## Belege

Jeder Entwurf hat eine `daten.json` mit den Inhalten und der Quelle, aus der
sie stammen. Was dort keine Quelle hat, darf nicht auf der Seite stehen. Beim
Acanto-Entwurf war "seit 2016" erfunden und fiel erst beim Nachprüfen auf; bei
hundert Seiten am Tag fällt so etwas niemandem mehr auf.
