# Lead-Dashboard

Oberfläche zur Bearbeitung der Lead-Tabelle. Läuft bei Vercel, redet mit
Supabase **nur serverseitig** über die Funktionen in `api/`.

## Warum nicht direkt aus dem Browser

Der Supabase `service_role`-Key umgeht jede Datenbanksicherung. Wer ihn hat,
kann die komplette Tabelle lesen, ändern und löschen. In einer Webseite stünde
er für jeden Besucher lesbar im Quelltext. Deshalb kennt die Oberfläche die
Datenbank nicht — sie fragt ausschließlich die eigenen API-Funktionen, und der
Key liegt in den Umgebungsvariablen bei Vercel.

## Umgebungsvariablen bei Vercel

| Name | Wert |
|---|---|
| `SUPABASE_URL` | aus Supabase → Project Settings → Data API |
| `SUPABASE_SERVICE_KEY` | der `service_role`-Key, derselbe wie lokal in `.env` |
| `DASHBOARD_PASSWORT` | frei wählbar, das Passwort zum Anmelden |
| `DASHBOARD_SECRET` | mindestens 24 Zeichen Zufall, signiert den Anmelde-Keks |

`DASHBOARD_SECRET` erzeugen:

    openssl rand -base64 32

## Aufträge

Das Dashboard kann nichts bauen — Nachbau und Scan brauchen einen Browser und
das Dateisystem. Ein Klick schreibt deshalb einen Auftrag in die Tabelle
`auftraege`, und `agent.mjs` auf dem Mac holt ihn ab. Beide warten nie
aufeinander.
