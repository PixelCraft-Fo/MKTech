# Template-urile de email pentru MKTech (EmailJS)

Creează 2 template-uri în EmailJS → **Email Templates** → *Create New Template*.
Copiază exact subiectul și conținutul de mai jos. Variabilele `{{...}}` sunt completate automat de site.

---

## 1. Template „client” (confirmarea către client)

**Settings → To Email:** `{{client_email}}`
**From Name:** `MKTech`
**Reply To:** `mktech2026@yahoo.com`

**Subject:**

```
Comanda ta MKTech {{nr_comanda}} a fost înregistrată
```

**Content:**

```
Bună, {{client_nume}}!

Îți mulțumim pentru comandă. Am înregistrat-o cu numărul {{nr_comanda}}.

PRODUSELE COMANDATE
{{produse_text}}

Subtotal: {{subtotal}}
Transport: {{transport}}
TOTAL: {{total}}

LIVRARE ȘI PLATĂ
Termen de livrare: 2–5 zile lucrătoare.
Plata: ramburs la livrare sau ordin de plată.

DATELE TALE
Nume: {{client_nume}}
Email: {{client_email}}
Telefon: {{client_telefon}}
Adresă de livrare: {{client_adresa}}
Observații: {{observatii}}

CONTACT MKTECH
F.E. MK Tech S.R.L.
Bulevardul Gării 25, Focșani, județul Vrancea
Telefon: 0237 212 544
Email: mktech2026@yahoo.com

Aceasta este o comandă într-o firmă de exercițiu (proiect școlar).
```

---

## 2. Template „firmă” (notificare către MKTech)

**Settings → To Email:** `{{email_firma}}`
**From Name:** `Site MKTech`
**Reply To:** `{{client_email}}`

**Subject:**

```
Comandă nouă {{nr_comanda}} de la {{client_nume}}
```

**Content:**

```
Comandă nouă primită de pe site.

Număr comandă: {{nr_comanda}}
Data: {{data_comanda}}

CLIENT
Nume / firmă: {{client_nume}}
Email: {{client_email}}
Telefon: {{client_telefon}}
Adresă de livrare: {{client_adresa}}
Observații: {{observatii}}

PRODUSE
{{produse_text}}

Subtotal: {{subtotal}}
Transport: {{transport}}
TOTAL: {{total}}
```

---

## Variabilele trimise de site

| Variabilă | Ce conține |
|---|---|
| `{{nr_comanda}}` | ex. MK-20261009-A7F3 |
| `{{data_comanda}}` | data și ora comenzii |
| `{{client_nume}}` | nume client / denumire firmă |
| `{{client_email}}` | emailul clientului (destinatarul template-ului 1) |
| `{{client_telefon}}` | telefonul clientului |
| `{{client_adresa}}` | adresa de livrare |
| `{{observatii}}` | observații (sau „-”) |
| `{{produse_text}}` | lista produselor, câte unul pe rând |
| `{{subtotal}}`, `{{transport}}`, `{{total}}` | sumele, ex. 1.299,00 lei |
| `{{email_firma}}` | mktech2026@yahoo.com (destinatarul template-ului 2) |
