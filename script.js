/* =====================================================================
   MKTech — script.js
   Tot JavaScript-ul site-ului: date produse, randare, coș, favorite,
   cont, căutare, carusel, meniu mobil, formular de contact.
   Vanilla JS, fără librării externe.

   CUPRINS
   1.  Configurare (link-uri social media, folder imagini, formular contact)
   1B. Date de completat de Robert (organigramă, noutăți, data actualizării)
   1C. Limbi și traducere (RO / EN / ES / DE) + dicționarul UI_DICT
   2.  Categorii & catalog produse (nume și descrieri în 4 limbi)
   3.  Utilitare (formatare preț, căutare, localStorage, iconițe)
   4.  Coș, favorite, cont (stocate în localStorage)
   5.  Header, navigare, footer (comune pe toate paginile)
   6.  Căutare live
   7.  Card produs + notificări (toast)
   8.  Pagini: index, produse, produs, coș, favorite, cont, contact,
       organigramă (despre), noutăți, listă de prețuri
   9.  Pornire
   ===================================================================== */

'use strict';

/* =====================================================================
   1. CONFIGURARE — AICI modifici setările site-ului
   ===================================================================== */
const CONFIG = {
  /* Folderul în care stau TOATE imaginile (logo, bannere, produse):
     folderul „imagini”, aflat lângă index.html. */
  imageFolder: 'imagini/',

  /* ✏️ LINK-URI SOCIAL MEDIA (apar în footer, pe toate paginile).
     Înlocuiește valorile '#TODO-...' cu link-urile reale, de ex.:
     instagram: 'https://www.instagram.com/mktech.fe/' */
  social: {
    instagram: '#TODO-link-instagram',
    tiktok: '#TODO-link-tiktok',
    facebook: '#TODO-link-facebook',
  },

  /* ✏️ FORMULAR DE CONTACT (contact.html)
     Site-ul e static (fără server), deci NU poate trimite singur emailuri.
     Momentan formularul doar validează datele și afișează un mesaj de succes simulat.
     Ca să primești mesajele reale pe email:
       1. Intră pe https://formspree.io și fă-ți un cont gratuit.
       2. Apasă „New form”, dă-i un nume (ex. „Contact MKTech”) și emailul unde vrei mesajele.
       3. Copiază endpoint-ul primit, arată ca: https://formspree.io/f/abcdwxyz
       4. Lipește-l mai jos, între ghilimele: contactFormEndpoint: 'https://formspree.io/f/abcdwxyz'
     Atât — codul de mai jos (funcția initContactPage) trimite automat mesajele acolo. */
  contactFormEndpoint: '',

  /* Cantitatea maximă dintr-un produs care poate fi pusă în coș */
  maxQty: 99,

  /* Bannerele din caruselul de pe pagina principală.
     Dimensiune recomandată: 1600 × 500 px. Ține textul și elementele importante
     în zona centrală, pentru că pe telefon marginile laterale se decupează puțin.
     href = pagina deschisă la click pe banner (poți pune și produs.html?id=laptop-5). */
  banners: [
    { file: 'banner1.png', alt: 'Ofertele MKTech', href: 'produse.html' },
    { file: 'banner2.png', alt: 'Echipamente pentru birou', href: 'produse.html#monitoare' },
    { file: 'banner3.png', alt: 'Laptopuri și unități PC', href: 'produse.html#laptopuri' },
  ],
  bannerInterval: 5500, // milisecunde între slide-uri

  /* Galeria (galerie.html): întâi pozele echipei (imagini/echipa1.png … echipa5.png),
     apoi restul pozelor (imagini/poza1.png … poza20.png). */
  teamPhotoCount: 5,
  galleryCount: 20,
};

/* =====================================================================
   1B. DATE DE COMPLETAT DE ROBERT (organigramă, noutăți, data actualizării)
   ===================================================================== */

/* ✏️ DATA ULTIMEI ACTUALIZĂRI — apare în footer, pe toate paginile.
   ATENȚIE: se schimbă DOAR manual, de aici. Site-ul e static (fără server),
   deci nu se actualizează singur. Modific-o de fiecare dată când schimbi
   ceva important pe site (produse, prețuri, texte, poze). */
const ULTIMA_ACTUALIZARE = '16 septembrie 2026';

/* ✏️ ORGANIGRAMA (apare în despre.html, secțiunea „Organigramă”)
   Structura reală a firmei MK Tech S.R.L.
   - `conducere`     → nivelurile de sus, unul sub altul: AGA → CA → MG
   - `departamente`  → cele trei direcții, fiecare cu birourile și membrii ei
   - `subordonate`   → birourile/departamentele aflate în subordinea altui birou
   - `membri`        → lista de nume afișată în fiecare cutie
   Denumirile funcțiilor și ale birourilor sunt traduse automat în EN/ES/DE
   (vezi dicționarul UI_DICT); numele persoanelor rămân la fel în toate limbile. */
const ORGANIGRAMA = {
  conducere: [
    { rol: 'AGA', detaliu: 'Adunarea Generală a Asociaților', membri: ['Gavrilă', 'Ghencea'] },
    { rol: 'CA', detaliu: 'Consiliul de Administrație', membri: ['Constantin', 'Negoiță', 'Gogonel'] },
    { rol: 'MG', detaliu: 'Manager General', membri: ['Negoiță'] },
  ],
  departamente: [
    {
      rol: 'Manager comercial',
      nume: 'Gogonel',
      icon: 'tag',
      birouri: [
        {
          titlu: 'B. Com',
          detaliu: 'Birou comercial',
          membri: ['Sava', 'Răzmeriță'],
          /* departamentele din subordinea biroului comercial */
          subordonate: [
            { titlu: 'D. Aprovizionare', detaliu: 'Departament aprovizionare', membri: ['Dragu', 'Corcoz', 'Cristea', 'Ene'] },
            { titlu: 'D. Desfacere', detaliu: 'Departament desfacere', membri: ['Moise', 'Iordache', 'Mihăilă', 'Manolache'] },
          ],
        },
        { titlu: 'B. MK', detaliu: 'Birou marketing', membri: ['Măciucă', 'Matei'] },
      ],
    },
    {
      rol: 'Director economic',
      nume: 'Gavrilă',
      icon: 'bag',
      birouri: [
        { titlu: 'Birou contabil', membri: ['Barniță', 'Tîrlă', 'Băjenaru'] },
        { titlu: 'Compartiment IT', membri: ['Vișoiu', 'Bălălău', 'Piftor'] },
      ],
    },
    {
      rol: 'Manager resurse umane',
      nume: 'Ghencea',
      icon: 'users',
      birouri: [
        { titlu: 'Birou calcul salarii', membri: ['Costăchioiu', 'Platon'] },
        { titlu: 'Birou resurse umane', membri: ['Olteanu', 'Cârjică', 'Vîlcu'] },
      ],
    },
  ],
};

/* ✏️ NOUTĂȚI (apar în noutati.html, „Forum de noutăți”)
   ROBERT: completează aici știrile — câte un obiect { } pentru fiecare.
   - `data`    → data afișată pe card (ex. '12.10.2026'); textele dintre [ ] le completezi tu
   - `imagine` → numele fișierului din folderul „imagini” (dacă lipsește poza,
                 apare un bloc gri cu „Imagine în curând”)
   - `titlu` și `text` → conținutul știrii, în română
   - traduceri: titlu_en / text_en, titlu_es / text_es, titlu_de / text_de
     (dacă lipsesc, se afișează automat varianta în română)
   - link în text: scrii [textul linkului](pagina.html), ca în ultima știre
   Prima știre din listă apare prima pe pagină. */
const NOUTATI = [
  {
    data: '[dată]',
    imagine: 'stire1.png',
    titlu: 'Primul stoc de produse al noii echipe MK Tech',
    text: 'Noua echipă a F.E. MK Tech S.R.L., formată din elevii clasei a XI-a A, a primit primul stoc de produse de când a preluat firma. Am completat oferta în toate cele cinci categorii: monitoare, periferice, unități PC, laptopuri, plus consumabile și rechizite. Fiecare produs a fost ales după raportul calitate-preț și după ce are nevoie un birou modern. Toate produsele sunt deja în catalogul online, cu descrieri complete și prețuri afișate clar.',
    titlu_en: 'The first stock of products for the new MK Tech team',
    text_en: 'The new team of F.E. MK Tech S.R.L., made up of the students of class 11 A, has received its first stock of products since taking over the company. We completed the offer in all five categories: monitors, peripherals, desktop PCs, laptops, plus supplies and consumables. Every product was chosen for its value for money and for what a modern office actually needs. All the products are already in the online catalog, with full descriptions and clearly displayed prices.',
    titlu_es: 'El primer stock de productos del nuevo equipo de MK Tech',
    text_es: 'El nuevo equipo de F.E. MK Tech S.R.L., formado por los alumnos de 11.º A, ha recibido su primer stock de productos desde que asumió la empresa. Hemos completado la oferta en las cinco categorías: monitores, periféricos, ordenadores de sobremesa, portátiles, además de consumibles y material de oficina. Cada producto se ha elegido por su relación calidad-precio y por lo que necesita realmente una oficina moderna. Todos los productos ya están en el catálogo en línea, con descripciones completas y precios indicados con claridad.',
    titlu_de: 'Der erste Warenbestand des neuen MK-Tech-Teams',
    text_de: 'Das neue Team der F.E. MK Tech S.R.L., bestehend aus den Schülerinnen und Schülern der Klasse 11 A, hat seinen ersten Warenbestand erhalten, seit es die Firma übernommen hat. Wir haben das Sortiment in allen fünf Kategorien ergänzt: Monitore, Peripheriegeräte, Desktop-PCs, Laptops sowie Verbrauchsmaterial und Bürobedarf. Jedes Produkt wurde nach dem Preis-Leistungs-Verhältnis und nach dem Bedarf eines modernen Büros ausgewählt. Alle Produkte sind bereits im Online-Katalog, mit vollständigen Beschreibungen und klar angegebenen Preisen.',
  },
  {
    data: '[dată]',
    imagine: 'stire2.png',
    titlu: 'MK Tech are un site nou',
    text: 'Am lansat noul site al firmei MK Tech, unde ne poți găsi toată oferta într-un singur loc. Poți căuta rapid produse, să le pui la favorite și să le adaugi în coș. Ai și o listă de prețuri completă. Site-ul e disponibil în română, engleză, spaniolă și germană, ca să îl poată folosi și partenerii din alte țări. La târguri ne găsești și prin codul QR de pe materialele noastre.',
    titlu_en: 'MK Tech has a new website',
    text_en: 'We have launched the new MK Tech website, where you can find our whole offer in one place. You can search for products quickly, save them to favorites and add them to the cart. There is also a full price list. The site is available in Romanian, English, Spanish and German, so partners from other countries can use it too. At trade fairs you can also find us through the QR code on our materials.',
    titlu_es: 'MK Tech tiene una web nueva',
    text_es: 'Hemos lanzado la nueva web de MK Tech, donde puedes encontrar toda nuestra oferta en un solo lugar. Puedes buscar productos rápidamente, guardarlos en favoritos y añadirlos al carrito. También tienes una lista de precios completa. La web está disponible en rumano, inglés, español y alemán, para que también la puedan usar los socios de otros países. En las ferias también nos encuentras mediante el código QR de nuestros materiales.',
    titlu_de: 'MK Tech hat eine neue Website',
    text_de: 'Wir haben die neue Website von MK Tech gestartet, auf der du unser gesamtes Angebot an einem Ort findest. Du kannst Produkte schnell suchen, zu den Favoriten hinzufügen und in den Warenkorb legen. Außerdem gibt es eine vollständige Preisliste. Die Website ist auf Rumänisch, Englisch, Spanisch und Deutsch verfügbar, damit sie auch Partner aus anderen Ländern nutzen können. Auf Messen findest du uns auch über den QR-Code auf unseren Materialien.',
  },
  {
    data: '[dată]',
    imagine: 'stire3.png',
    titlu: 'Reduceri în fiecare categorie de produse',
    text: 'Ca să sărbătorim noul început, am pus câte o reducere în fiecare categorie de produse. Le găsești pe toate pe pagina [Reduceri](reduceri.html) din meniul Produse și în secțiunea „Top reduceri” de pe pagina principală. Ofertele sunt valabile [perioada / în limita stocului].',
    titlu_en: 'Discounts in every product category',
    text_en: 'To celebrate the new beginning, we have added one discount in every product category. You can find them all on the [Discounts](reduceri.html) page in the Products menu and in the “Top Deals” section on the home page. The offers are valid [perioada / în limita stocului].',
    titlu_es: 'Descuentos en todas las categorías de productos',
    text_es: 'Para celebrar el nuevo comienzo, hemos puesto un descuento en cada categoría de productos. Los encuentras todos en la página [Descuentos](reduceri.html) del menú Productos y en la sección «Mejores ofertas» de la página principal. Las ofertas son válidas [perioada / în limita stocului].',
    titlu_de: 'Rabatte in jeder Produktkategorie',
    text_de: 'Um den Neuanfang zu feiern, haben wir in jeder Produktkategorie einen Rabatt eingerichtet. Du findest sie alle auf der Seite [Rabatte](reduceri.html) im Menü Produkte und im Bereich „Top-Angebote“ auf der Startseite. Die Angebote gelten [perioada / în limita stocului].',
  },
];


/* =====================================================================
   1C. LIMBI ȘI TRADUCERE (Română / English / Español / Deutsch)

   CUM FUNCȚIONEAZĂ (pe scurt):
   - Textele site-ului se scriu normal, în ROMÂNĂ, direct în HTML sau în JS.
   - Dicționarul UI_DICT de mai jos leagă fiecare text românesc de cele 3 traduceri.
   - Când vizitatorul schimbă limba, textele de pe pagină sunt înlocuite automat,
     iar alegerea se salvează în localStorage (cheia „mktech_lang”).
   - Dacă un text NU are traducere în dicționar, rămâne afișat în română (fallback).

   CA SĂ ADAUGI UN TEXT NOU TRADUS:
     1. scrii textul în română, ca de obicei;
     2. adaugi o linie în UI_DICT, exact cu textul românesc între ghilimele:
        'Textul meu nou': ['English text', 'Texto en español', 'Deutscher Text'],

   ATENȚIE: prețurile rămân în LEI în toate limbile (nu se face conversie valutară).
   ===================================================================== */
const LANGS = [
  { code: 'ro', short: 'RO', label: 'Română' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'es', short: 'ES', label: 'Español' },
  { code: 'de', short: 'DE', label: 'Deutsch' },
];

/* poziția fiecărei limbi în listele din UI_DICT: ['EN', 'ES', 'DE'] */
const LANG_INDEX = { en: 0, es: 1, de: 2 };

let CURRENT_LANG = 'ro';

/* ✏️ DICȚIONARUL DE TRADUCERI
   Format:  'text în română': ['English', 'Español', 'Deutsch'],
   Textele care nu apar aici rămân afișate în română. */
const UI_DICT = {
  /* ----- Meniu, header, căutare ----- */
  'Produse': ['Products', 'Productos', 'Produkte'],
  'Acasă': ['Home', 'Inicio', 'Startseite'],
  'Despre noi': ['About Us', 'Sobre nosotros', 'Über uns'],
  'Contact': ['Contact', 'Contacto', 'Kontakt'],
  'Noutăți': ['News', 'Noticias', 'Neuigkeiten'],
  'Cont': ['Account', 'Cuenta', 'Konto'],
  'Favorite': ['Favorites', 'Favoritos', 'Favoriten'],
  'Coș': ['Cart', 'Carrito', 'Warenkorb'],
  'Meniu': ['Menu', 'Menú', 'Menü'],
  'Soluții smart pentru birou!': ['Smart solutions for your office!', '¡Soluciones inteligentes para la oficina!', 'Smarte Lösungen fürs Büro!'],
  'Caută monitoare, laptopuri…': ['Search monitors, laptops…', 'Buscar monitores, portátiles…', 'Monitore, Laptops suchen…'],
  'Caută produse': ['Search products', 'Buscar productos', 'Produkte suchen'],
  'Șterge căutarea': ['Clear search', 'Borrar búsqueda', 'Suche löschen'],
  'Sari la conținut': ['Skip to content', 'Saltar al contenido', 'Zum Inhalt springen'],
  'MKTech — pagina principală': ['MKTech — home page', 'MKTech — página principal', 'MKTech — Startseite'],
  'Cont, favorite și coș': ['Account, favorites and cart', 'Cuenta, favoritos y carrito', 'Konto, Favoriten und Warenkorb'],
  'Navigare principală': ['Main navigation', 'Navegación principal', 'Hauptnavigation'],
  'Vezi toate produsele': ['See all products', 'Ver todos los productos', 'Alle Produkte ansehen'],
  'Schimbă limba site-ului': ['Change site language', 'Cambiar el idioma del sitio', 'Sprache der Website ändern'],
  'Coșul de cumpărături': ['Shopping cart', 'Carrito de compra', 'Warenkorb'],
  'Breadcrumb': ['Breadcrumb', 'Ruta de navegación', 'Navigationspfad'],
  'Rezultate căutare': ['Search results', 'Resultados de búsqueda', 'Suchergebnisse'],
  'Niciun produs găsit': ['No products found', 'No se encontraron productos', 'Keine Produkte gefunden'],
  'Nu am găsit produse pentru „': ['We found no products for “', 'No encontramos productos para «', 'Keine Produkte gefunden für „'],
  '”. Verifică ortografia sau încearcă un termen mai general.': [
    '”. Check the spelling or try a more general term.',
    '». Comprueba la ortografía o prueba con un término más general.',
    '“. Prüfe die Schreibweise oder versuche einen allgemeineren Begriff.',
  ],
  'Verifică ortografia sau încearcă un termen mai general (ex. „monitor”, „laptop”, „mouse”).': [
    'Check the spelling or try a more general term (e.g. “monitor”, “laptop”, “mouse”).',
    'Comprueba la ortografía o prueba con un término más general (p. ej. «monitor», «portátil», «ratón»).',
    'Prüfe die Schreibweise oder versuche einen allgemeineren Begriff (z. B. „Monitor“, „Laptop“, „Maus“).',
  ],
  'Vezi rezultatele în catalog': ['See results in the catalog', 'Ver los resultados en el catálogo', 'Ergebnisse im Katalog ansehen'],
  'Afișează toate produsele': ['Show all products', 'Mostrar todos los productos', 'Alle Produkte anzeigen'],
  'Sari la categorie': ['Jump to category', 'Ir a la categoría', 'Zur Kategorie springen'],
  'Caută în catalog': ['Search the catalog', 'Buscar en el catálogo', 'Im Katalog suchen'],
  'Caută în catalog…': ['Search the catalog…', 'Buscar en el catálogo…', 'Im Katalog suchen…'],
  'Închide notificarea': ['Close the notification', 'Cerrar la notificación', 'Benachrichtigung schließen'],

  /* ----- Categorii ----- */
  'Monitoare': ['Monitors', 'Monitores', 'Monitore'],
  'Periferice': ['Peripherals', 'Periféricos', 'Peripheriegeräte'],
  'Unități': ['Desktop PCs', 'Ordenadores de sobremesa', 'Desktop-PCs'],
  'Laptopuri': ['Laptops', 'Portátiles', 'Laptops'],
  'Consumabile și rechizite': ['Supplies & Consumables', 'Consumibles y material de oficina', 'Verbrauchsmaterial & Bürobedarf'],
  'Consumabile': ['Supplies', 'Consumibles', 'Verbrauchsmaterial'],
  'Monitor': ['Monitor', 'Monitor', 'Monitor'],
  'Unitate PC': ['Desktop PC', 'Ordenador de sobremesa', 'Desktop-PC'],

  /* ----- Pagina principală ----- */
  'MKTech — Electronice și birotică': ['MKTech — Electronics and office supplies', 'MKTech — Electrónica y material de oficina', 'MKTech — Elektronik und Bürobedarf'],
  'Selecția MKTech': ['MKTech Selection', 'Selección MKTech', 'MKTech Auswahl'],
  'Produse recomandate': ['Recommended Products', 'Productos recomendados', 'Empfohlene Produkte'],
  'Toate produsele': ['All Products', 'Todos los productos', 'Alle Produkte'],
  'Prețuri reduse': ['Discounted Prices', 'Precios reducidos', 'Reduzierte Preise'],
  'Top reduceri': ['Top Deals', 'Mejores ofertas', 'Top-Angebote'],
  'Câte o ofertă din fiecare categorie.': ['One deal from each category.', 'Una oferta de cada categoría.', 'Ein Angebot aus jeder Kategorie.'],
  'De ce să cumperi de la MKTech': ['Why buy from MKTech', 'Por qué comprar en MKTech', 'Warum bei MKTech kaufen'],
  'Livrare rapidă': ['Fast Delivery', 'Entrega rápida', 'Schneller Versand'],
  'Comenzile pleacă repede spre tine': ['Orders ship quickly to you', 'Los pedidos salen rápido hacia ti', 'Bestellungen werden schnell versendet'],
  'Garanție inclusă': ['Warranty Included', 'Garantía incluida', 'Garantie inbegriffen'],
  'Pentru echipamentele din catalog': ['For all catalog equipment', 'Para los equipos del catálogo', 'Für alle Geräte im Katalog'],
  'Plată securizată': ['Secure Payment', 'Pago seguro', 'Sichere Zahlung'],
  'Date protejate la fiecare comandă': ['Data protected on every order', 'Datos protegidos en cada pedido', 'Daten bei jeder Bestellung geschützt'],
  'Suport dedicat': ['Dedicated Support', 'Soporte dedicado', 'Persönlicher Support'],
  'Te ajutăm să alegi produsul potrivit': ['We help you choose the right product', 'Te ayudamos a elegir el producto adecuado', 'Wir helfen dir, das richtige Produkt zu wählen'],
  'Bannere promoționale': ['Promotional banners', 'Banners promocionales', 'Werbebanner'],
  'Bannerul anterior': ['Previous banner', 'Banner anterior', 'Vorheriges Banner'],
  'Bannerul următor': ['Next banner', 'Banner siguiente', 'Nächstes Banner'],
  'Ofertele MKTech': ['MKTech deals', 'Ofertas MKTech', 'MKTech Angebote'],
  'Echipamente pentru birou': ['Office equipment', 'Equipos de oficina', 'Büroausstattung'],
  'Laptopuri și unități PC': ['Laptops and desktop PCs', 'Portátiles y ordenadores de sobremesa', 'Laptops und Desktop-PCs'],

  /* ----- Card produs & pagina de produs ----- */
  'Adaugă în coș': ['Add to Cart', 'Añadir al carrito', 'In den Warenkorb'],
  'Adăugat': ['Added', 'Añadido', 'Hinzugefügt'],
  'Adaugă la favorite': ['Add to Favorites', 'Añadir a favoritos', 'Zu Favoriten hinzufügen'],
  'Elimină de la favorite': ['Remove from Favorites', 'Quitar de favoritos', 'Aus Favoriten entfernen'],
  'Elimină': ['Remove', 'Quitar', 'Entfernen'],
  'În favorite': ['In favorites', 'En favoritos', 'In Favoriten'],
  'Preț vechi': ['Old price', 'Precio anterior', 'Alter Preis'],
  'Preț nou': ['New price', 'Precio nuevo', 'Neuer Preis'],
  'Preț vechi:': ['Old price:', 'Precio anterior:', 'Alter Preis:'],
  'Preț nou:': ['New price:', 'Precio nuevo:', 'Neuer Preis:'],
  'Cantitate': ['Quantity', 'Cantidad', 'Menge'],
  'Scade cantitatea': ['Decrease quantity', 'Reducir cantidad', 'Menge verringern'],
  'Crește cantitatea': ['Increase quantity', 'Aumentar cantidad', 'Menge erhöhen'],
  'Specificații tehnice': ['Technical specifications', 'Especificaciones técnicas', 'Technische Daten'],
  'Vezi categoria': ['See category', 'Ver categoría', 'Kategorie ansehen'],
  'Alte imagini ale produsului': ['Other product images', 'Otras imágenes del producto', 'Weitere Produktbilder'],
  'Imaginea anterioară': ['Previous image', 'Imagen anterior', 'Vorheriges Bild'],
  'Imaginea următoare': ['Next image', 'Imagen siguiente', 'Nächstes Bild'],
  'Produsul nu a fost găsit': ['Product not found', 'Producto no encontrado', 'Produkt nicht gefunden'],
  'Produs negăsit': ['Product not found', 'Producto no encontrado', 'Produkt nicht gefunden'],
  'Link-ul poate fi greșit sau produsul nu mai există. Caută-l în catalogul nostru.': [
    'The link may be wrong or the product no longer exists. Search for it in our catalog.',
    'El enlace puede ser incorrecto o el producto ya no existe. Búscalo en nuestro catálogo.',
    'Der Link ist möglicherweise falsch oder das Produkt existiert nicht mehr. Suche es in unserem Katalog.',
  ],
  'Mergi la catalog': ['Go to catalog', 'Ir al catálogo', 'Zum Katalog'],
  'Catalog produse': ['Product catalog', 'Catálogo de productos', 'Produktkatalog'],
  '30 de produse pentru birou, școală și acasă, grupate în 5 categorii.': [
    '30 products for the office, school, and home, grouped into 5 categories.',
    '30 productos para la oficina, la escuela y el hogar, agrupados en 5 categorías.',
    '30 Produkte für Büro, Schule und Zuhause, in 5 Kategorien gegliedert.',
  ],

  /* ----- Coș & finalizare comandă ----- */
  'Coșul tău': ['Your cart', 'Tu carrito', 'Dein Warenkorb'],
  'Coșul tău este gol': ['Your cart is empty', 'Tu carrito está vacío', 'Dein Warenkorb ist leer'],
  'Adaugă produse din catalog și le vei găsi aici. Coșul rămâne salvat chiar dacă închizi browserul.': [
    'Add products from the catalog and you will find them here. Your cart stays saved even if you close the browser.',
    'Añade productos del catálogo y los encontrarás aquí. El carrito se guarda aunque cierres el navegador.',
    'Füge Produkte aus dem Katalog hinzu, dann findest du sie hier. Der Warenkorb bleibt gespeichert, auch wenn du den Browser schließt.',
  ],
  'Descoperă produsele': ['Discover the products', 'Descubre los productos', 'Produkte entdecken'],
  'Golește coșul': ['Empty the cart', 'Vaciar el carrito', 'Warenkorb leeren'],
  'Sigur vrei să golești coșul?': ['Are you sure you want to empty the cart?', '¿Seguro que quieres vaciar el carrito?', 'Möchtest du den Warenkorb wirklich leeren?'],
  'Produse în coș': ['Products in cart', 'Productos en el carrito', 'Produkte im Warenkorb'],
  'Sumar comandă': ['Order summary', 'Resumen del pedido', 'Bestellübersicht'],
  'Subtotal': ['Subtotal', 'Subtotal', 'Zwischensumme'],
  'Reduceri': ['Discounts', 'Descuentos', 'Rabatte'],
  'Total': ['Total', 'Total', 'Gesamt'],
  'Finalizează comanda': ['Place order', 'Finalizar pedido', 'Bestellung abschließen'],
  'Continuă cumpărăturile': ['Continue shopping', 'Seguir comprando', 'Weiter einkaufen'],
  'Comandă simulată.': ['Simulated order.', 'Pedido simulado.', 'Simulierte Bestellung.'],
  'MKTech este o firmă de exercițiu: nu se procesează nicio plată reală și nu se livrează produse.': [
    'MKTech is a student training company: no real payment is processed and no products are shipped.',
    'MKTech es una empresa de prácticas: no se procesa ningún pago real ni se envían productos.',
    'MKTech ist eine Übungsfirma: Es wird keine echte Zahlung verarbeitet und es werden keine Produkte geliefert.',
  ],
  'Comanda a fost plasată cu succes!': ['Your order has been placed successfully!', '¡Tu pedido se ha realizado con éxito!', 'Deine Bestellung wurde erfolgreich aufgegeben!'],
  'Mulțumim! Mai jos găsești detaliile comenzii.': ['Thank you! You will find the order details below.', '¡Gracias! A continuación encontrarás los detalles del pedido.', 'Danke! Unten findest du die Bestelldetails.'],
  'Număr comandă': ['Order number', 'Número de pedido', 'Bestellnummer'],
  'Aceasta este o': ['This is a', 'Este es un', 'Dies ist eine'],
  'comandă simulată': ['simulated order', 'pedido simulado', 'simulierte Bestellung'],
  '(proiect de firmă de exercițiu). Nu s-a efectuat nicio plată și nu se livrează produse.': [
    '(student training company project). No payment was made and no products will be shipped.',
    '(proyecto de empresa de prácticas). No se ha realizado ningún pago ni se enviarán productos.',
    '(Schulprojekt, Übungsfirma). Es wurde keine Zahlung getätigt und es werden keine Produkte geliefert.',
  ],
  'Înapoi la magazin': ['Back to the shop', 'Volver a la tienda', 'Zurück zum Shop'],
  'Produs eliminat din coș': ['Product removed from cart', 'Producto eliminado del carrito', 'Produkt aus dem Warenkorb entfernt'],
  'Șterge din coș': ['Remove from cart', 'Eliminar del carrito', 'Aus dem Warenkorb entfernen'],
  'Adăugat în coș': ['Added to cart', 'Añadido al carrito', 'Zum Warenkorb hinzugefügt'],
  'Vezi coșul': ['View cart', 'Ver carrito', 'Warenkorb ansehen'],
  'Produse adăugate în coș': ['Products added to cart', 'Productos añadidos al carrito', 'Produkte zum Warenkorb hinzugefügt'],

  /* ----- Favorite ----- */
  'Produse favorite': ['Favorite products', 'Productos favoritos', 'Lieblingsprodukte'],
  'Produsele salvate rămân aici și după ce închizi browserul.': [
    'Saved products stay here even after you close the browser.',
    'Los productos guardados permanecen aquí incluso después de cerrar el navegador.',
    'Gespeicherte Produkte bleiben hier, auch nachdem du den Browser geschlossen hast.',
  ],
  'Adaugă toate în coș': ['Add all to cart', 'Añadir todo al carrito', 'Alle in den Warenkorb'],
  'Nu ai încă produse favorite': ['You have no favorite products yet', 'Aún no tienes productos favoritos', 'Du hast noch keine Lieblingsprodukte'],
  'Apasă pe inimioara de pe orice produs ca să îl salvezi aici pentru mai târziu.': [
    'Tap the heart on any product to save it here for later.',
    'Pulsa el corazón de cualquier producto para guardarlo aquí para más tarde.',
    'Tippe auf das Herz eines Produkts, um es hier für später zu speichern.',
  ],
  'Explorează catalogul': ['Explore the catalog', 'Explora el catálogo', 'Katalog erkunden'],
  'Salvat la favorite': ['Saved to favorites', 'Guardado en favoritos', 'Zu Favoriten gespeichert'],
  'Eliminat de la favorite': ['Removed from favorites', 'Quitado de favoritos', 'Aus Favoriten entfernt'],
  'Vezi favorite': ['View favorites', 'Ver favoritos', 'Favoriten ansehen'],

  /* ----- Pagini și texte adăugate ulterior ----- */
  'Forum de noutăți': ['News forum', 'Foro de noticias', 'Neuigkeiten-Forum'],
  'Reduceri': ['Discounts', 'Descuentos', 'Rabatte'],
  'Produse la reducere': ['Discounted products', 'Productos en oferta', 'Reduzierte Produkte'],
  'Toate produsele cu preț redus, dintr-un singur loc.': [
    'All discounted products, in one place.',
    'Todos los productos rebajados, en un solo lugar.',
    'Alle reduzierten Produkte an einem Ort.',
  ],
  'Momentan nu există produse la reducere.': [
    'There are no discounted products at the moment.',
    'Por el momento no hay productos en oferta.',
    'Derzeit gibt es keine reduzierten Produkte.',
  ],
  'Cost transport: 15 lei (gratuit pentru comenzi peste 300 lei).': [
    'Shipping cost: 15 lei (free for orders over 300 lei).',
    'Gastos de envío: 15 lei (gratis para pedidos de más de 300 lei).',
    'Versandkosten: 15 Lei (kostenlos ab 300 Lei Bestellwert).',
  ],
  'Termen de livrare estimat: 2–5 zile lucrătoare.': [
    'Estimated delivery time: 2–5 working days.',
    'Plazo de entrega estimado: 2–5 días laborables.',
    'Voraussichtliche Lieferzeit: 2–5 Werktage.',
  ],
  'Ghid site': ['Site guide', 'Guía del sitio', 'Website-Leitfaden'],
  'Acest ghid te ajută să găsești rapid ce cauți pe site-ul MKTech.': [
    'This guide helps you quickly find what you are looking for on the MKTech website.',
    'Esta guía te ayuda a encontrar rápidamente lo que buscas en el sitio de MKTech.',
    'Dieser Leitfaden hilft dir, schnell zu finden, was du auf der MKTech-Website suchst.',
  ],
  'Pagina principală, cu bannere, oferte și produse recomandate.': [
    'The home page, with banners, deals and recommended products.',
    'La página principal, con banners, ofertas y productos recomendados.',
    'Die Startseite mit Bannern, Angeboten und empfohlenen Produkten.',
  ],
  'Catalogul complet, grupat pe cele 5 categorii.': [
    'The full catalog, grouped into the 5 categories.',
    'El catálogo completo, agrupado en las 5 categorías.',
    'Der vollständige Katalog, in 5 Kategorien gegliedert.',
  ],
  'Produsele care au în acest moment preț redus.': [
    'The products that currently have a reduced price.',
    'Los productos que actualmente tienen precio rebajado.',
    'Die Produkte, die aktuell einen reduzierten Preis haben.',
  ],
  'Povestea firmei, misiunea, echipa și organigrama.': [
    'The company story, mission, team and organizational chart.',
    'La historia de la empresa, la misión, el equipo y el organigrama.',
    'Die Firmengeschichte, Mission, das Team und das Organigramm.',
  ],
  'Anunțuri și noutăți despre activitatea firmei.': [
    'Announcements and news about the company activity.',
    'Anuncios y novedades sobre la actividad de la empresa.',
    'Ankündigungen und Neuigkeiten zur Arbeit der Firma.',
  ],
  'Date de contact, formular de mesaje și harta cu sediul.': [
    'Contact details, message form and the map with our location.',
    'Datos de contacto, formulario de mensajes y el mapa con la sede.',
    'Kontaktdaten, Nachrichtenformular und Karte mit dem Standort.',
  ],
  'Toate produsele și prețurile într-un tabel, gata de printat.': [
    'All products and prices in a table, ready to print.',
    'Todos los productos y precios en una tabla, lista para imprimir.',
    'Alle Produkte und Preise in einer Tabelle, druckfertig.',
  ],
  'Autentificare sau creare de cont (salvat local, în browser).': [
    'Sign in or create an account (saved locally, in the browser).',
    'Inicia sesión o crea una cuenta (guardada localmente, en el navegador).',
    'Anmelden oder Konto erstellen (lokal im Browser gespeichert).',
  ],
  'Produsele salvate cu inimioara.': [
    'The products you saved with the heart icon.',
    'Los productos que has guardado con el corazón.',
    'Die Produkte, die du mit dem Herz gespeichert hast.',
  ],
  'Produsele adăugate în coș și finalizarea comenzii.': [
    'The products added to the cart and the checkout.',
    'Los productos añadidos al carrito y la finalización del pedido.',
    'Die Produkte im Warenkorb und der Bestellabschluss.',
  ],
  'Structura site-ului': ['Site structure', 'Estructura del sitio', 'Aufbau der Website'],

  /* ----- Organigramă & galerie foto ----- */
  'Adunarea Generală a Asociaților': ['General Meeting of Shareholders', 'Junta General de Socios', 'Gesellschafterversammlung'],
  'Consiliul de Administrație': ['Board of Directors', 'Consejo de Administración', 'Verwaltungsrat'],
  'Manager General': ['General Manager', 'Director General', 'Geschäftsführer'],
  'Manager comercial': ['Commercial Manager', 'Director comercial', 'Vertriebsleiter'],
  'Director economic': ['Finance Director', 'Director económico', 'Kaufmännischer Leiter'],
  'Manager resurse umane': ['HR Manager', 'Director de Recursos Humanos', 'Personalleiter'],
  'Birou comercial': ['Sales office', 'Oficina comercial', 'Vertriebsbüro'],
  'Birou marketing': ['Marketing office', 'Oficina de marketing', 'Marketingbüro'],
  'Departament aprovizionare': ['Purchasing department', 'Departamento de compras', 'Einkaufsabteilung'],
  'Departament desfacere': ['Sales department', 'Departamento de ventas', 'Verkaufsabteilung'],
  'Birou contabil': ['Accounting office', 'Oficina de contabilidad', 'Buchhaltung'],
  'Compartiment IT': ['IT department', 'Departamento de TI', 'IT-Abteilung'],
  'Birou calcul salarii': ['Payroll office', 'Oficina de nóminas', 'Lohnbuchhaltung'],
  'Birou resurse umane': ['HR office', 'Oficina de recursos humanos', 'Personalbüro'],
  'Echipa în activitate': ['The team at work', 'El equipo en acción', 'Das Team bei der Arbeit'],
  'Galerie foto': ['Photo gallery', 'Galería de fotos', 'Fotogalerie'],
  'Imagine în curând': ['Image coming soon', 'Imagen próximamente', 'Bild folgt in Kürze'],
  'Momente de la târguri, evenimente și din activitatea echipei MKTech.': [
    'Moments from trade fairs, events and the activity of the MKTech team.',
    'Momentos de ferias, eventos y de la actividad del equipo de MKTech.',
    'Momente von Messen, Veranstaltungen und aus der Arbeit des MKTech-Teams.',
  ],
  'Mai multe poze cu echipa': ['More photos of the team', 'Más fotos del equipo', 'Mehr Fotos vom Team'],
  'Momente de la târguri, evenimente și din activitatea de zi cu zi.': [
    'Moments from trade fairs, events and everyday work.',
    'Momentos de ferias, eventos y del día a día.',
    'Momente von Messen, Veranstaltungen und aus dem Arbeitsalltag.',
  ],
  'Vezi galeria foto completă': ['See the full photo gallery', 'Ver la galería de fotos completa', 'Zur vollständigen Fotogalerie'],
  'Organigrama echipei, cu membrii': ['Team chart with the members', 'Organigrama del equipo con los miembros', 'Teamorganigramm mit den Mitgliedern'],
  'Organigrama firmei MK Tech S.R.L.': ['Organizational chart of MK Tech S.R.L.', 'Organigrama de MK Tech S.R.L.', 'Organigramm der MK Tech S.R.L.'],
  'Apasă pe o organigramă ca să o vezi mărită.': [
    'Tap an organizational chart to see it enlarged.',
    'Pulsa un organigrama para verlo ampliado.',
    'Tippe auf ein Organigramm, um es vergrößert zu sehen.',
  ],
  'Poze de la târguri, evenimente și din activitatea echipei.': [
    'Photos from trade fairs, events and the team activity.',
    'Fotos de ferias, eventos y de la actividad del equipo.',
    'Fotos von Messen, Veranstaltungen und der Teamarbeit.',
  ],
  'Închide': ['Close', 'Cerrar', 'Schließen'],
  'Imagine mărită': ['Enlarged image', 'Imagen ampliada', 'Vergrößertes Bild'],

  /* ----- Formular de comandă ----- */
  'Formular de comandă': ['Order form', 'Formulario de pedido', 'Bestellformular'],
  'Nr crt': ['No.', 'N.º', 'Nr.'],
  'Denumire produs': ['Product name', 'Nombre del producto', 'Produktname'],
  'U.M.': ['Unit', 'U.M.', 'Einheit'],
  'Preț produs': ['Product price', 'Precio del producto', 'Produktpreis'],
  '— alege produsul —': ['— choose the product —', '— elige el producto —', '— Produkt wählen —'],
  '+ Adaugă produs': ['+ Add product', '+ Añadir producto', '+ Produkt hinzufügen'],
  'Șterge rândul': ['Delete the row', 'Eliminar la fila', 'Zeile löschen'],
  'Transport': ['Shipping', 'Envío', 'Versand'],
  'Gratuit': ['Free', 'Gratis', 'Kostenlos'],
  'Transport 15 lei, gratuit pentru comenzi peste 300 lei.': [
    'Shipping 15 lei, free for orders over 300 lei.',
    'Envío 15 lei, gratis para pedidos de más de 300 lei.',
    'Versand 15 Lei, kostenlos ab 300 Lei.',
  ],
  'Nume și prenume / Denumire firmă': ['Full name / Company name', 'Nombre y apellidos / Nombre de la empresa', 'Vor- und Nachname / Firmenname'],
  'Adresă de livrare': ['Delivery address', 'Dirección de entrega', 'Lieferadresse'],
  'Observații (opțional)': ['Notes (optional)', 'Observaciones (opcional)', 'Anmerkungen (optional)'],
  'Sunt de acord cu prelucrarea datelor pentru procesarea comenzii.': [
    'I agree to the processing of my data for the purpose of handling this order.',
    'Acepto el tratamiento de mis datos para gestionar el pedido.',
    'Ich stimme der Verarbeitung meiner Daten zur Bearbeitung der Bestellung zu.',
  ],
  'Termen de livrare: 2–5 zile lucrătoare. Plata: ramburs la livrare sau ordin de plată.': [
    'Delivery time: 2–5 working days. Payment: cash on delivery or bank transfer.',
    'Plazo de entrega: 2–5 días laborables. Pago: contra reembolso o transferencia.',
    'Lieferzeit: 2–5 Werktage. Zahlung: per Nachnahme oder Überweisung.',
  ],
  'Trimite comanda': ['Send the order', 'Enviar el pedido', 'Bestellung senden'],
  'Comandă nouă': ['New order', 'Pedido nuevo', 'Neue Bestellung'],
  'Ți-am trimis confirmarea pe email.': [
    'We have sent you the confirmation by email.',
    'Te hemos enviado la confirmación por correo.',
    'Wir haben dir die Bestätigung per E-Mail geschickt.',
  ],
  'Alege cel puțin un produs.': ['Choose at least one product.', 'Elige al menos un producto.', 'Wähle mindestens ein Produkt.'],
  'Completează numele sau denumirea firmei.': ['Enter your name or company name.', 'Introduce tu nombre o el de la empresa.', 'Gib deinen Namen oder Firmennamen ein.'],
  'Completează adresa de email.': ['Enter your email address.', 'Introduce tu dirección de correo.', 'Gib deine E-Mail-Adresse ein.'],
  'Completează numărul de telefon.': ['Enter your phone number.', 'Introduce tu número de teléfono.', 'Gib deine Telefonnummer ein.'],
  'Numărul de telefon nu este valid (ex. 0712 345 678).': [
    'The phone number is not valid (e.g. 0712 345 678).',
    'El número de teléfono no es válido (p. ej. 0712 345 678).',
    'Die Telefonnummer ist ungültig (z. B. 0712 345 678).',
  ],
  'Completează adresa de livrare.': ['Enter the delivery address.', 'Introduce la dirección de entrega.', 'Gib die Lieferadresse ein.'],
  'Bifează acordul pentru prelucrarea datelor.': [
    'Tick the box to agree to the processing of your data.',
    'Marca la casilla para aceptar el tratamiento de datos.',
    'Setze das Häkchen für die Datenverarbeitung.',
  ],
  'Verifică datele completate mai sus.': ['Check the details filled in above.', 'Revisa los datos introducidos arriba.', 'Prüfe die oben eingegebenen Daten.'],
  'Comanda nu a putut fi trimisă. Verifică conexiunea la internet și încearcă din nou.': [
    'The order could not be sent. Check your internet connection and try again.',
    'No se ha podido enviar el pedido. Comprueba tu conexión a internet e inténtalo de nuevo.',
    'Die Bestellung konnte nicht gesendet werden. Prüfe deine Internetverbindung und versuche es erneut.',
  ],
  'Comanda a fost înregistrată, dar emailul de confirmare nu a putut fi trimis.': [
    'The order was registered, but the confirmation email could not be sent.',
    'El pedido se ha registrado, pero no se ha podido enviar el correo de confirmación.',
    'Die Bestellung wurde erfasst, aber die Bestätigungs-E-Mail konnte nicht gesendet werden.',
  ],
  'Ai trimis deja o comandă. Mai așteaptă 30 de secunde înainte de următoarea.': [
    'You have already sent an order. Please wait 30 seconds before the next one.',
    'Ya has enviado un pedido. Espera 30 segundos antes del siguiente.',
    'Du hast bereits eine Bestellung gesendet. Warte 30 Sekunden bis zur nächsten.',
  ],
  'Organigramă': ['Organizational chart', 'Organigrama', 'Organigramm'],
  'Echipa și structura organizatorică a firmei MKTech.': [
    'The team and the organizational structure of MKTech.',
    'El equipo y la estructura organizativa de MKTech.',
    'Das Team und die Organisationsstruktur von MKTech.',
  ],
  'Vezi organigrama': ['See the organizational chart', 'Ver el organigrama', 'Organigramm ansehen'],
  'Vezi galeria foto': ['See the photo gallery', 'Ver la galería de fotos', 'Fotogalerie ansehen'],
  'Echipa și structura organizatorică a firmei.': [
    'The team and the organizational structure of the company.',
    'El equipo y la estructura organizativa de la empresa.',
    'Das Team und die Organisationsstruktur der Firma.',
  ],
  'Poze de la târguri, evenimente și din activitate.': [
    'Photos from trade fairs, events and our activity.',
    'Fotos de ferias, eventos y de nuestra actividad.',
    'Fotos von Messen, Veranstaltungen und unserer Arbeit.',
  ],
  'Povestea și valorile firmei': ['The company story and values', 'La historia y los valores de la empresa', 'Geschichte und Werte der Firma'],
  'Echipa și structura firmei': ['The team and company structure', 'El equipo y la estructura de la empresa', 'Team und Firmenstruktur'],
  'Poze de la evenimente': ['Photos from events', 'Fotos de eventos', 'Fotos von Veranstaltungen'],
  'Date de livrare': ['Delivery details', 'Datos de entrega', 'Lieferdaten'],
  'Plasează comanda': ['Place the order', 'Realizar el pedido', 'Bestellung aufgeben'],
  'Înapoi la produse': ['Back to products', 'Volver a los productos', 'Zurück zu den Produkten'],
  'Termen de livrare: 2–5 zile lucrătoare.': [
    'Delivery time: 2–5 working days.',
    'Plazo de entrega: 2–5 días laborables.',
    'Lieferzeit: 2–5 Werktage.',
  ],
  'Plata: ramburs la livrare sau ordin de plată.': [
    'Payment: cash on delivery or bank transfer.',
    'Pago: contra reembolso o transferencia bancaria.',
    'Zahlung: per Nachnahme oder Überweisung.',
  ],
  'Termen de livrare: 2–5 zile lucrătoare. Plata: ramburs la livrare sau ordin de plată.': [
    'Delivery time: 2–5 working days. Payment: cash on delivery or bank transfer.',
    'Plazo de entrega: 2–5 días laborables. Pago: contra reembolso o transferencia bancaria.',
    'Lieferzeit: 2–5 Werktage. Zahlung: per Nachnahme oder Überweisung.',
  ],
  'Verifică datele de livrare.': ['Check the delivery details.', 'Revisa los datos de entrega.', 'Prüfe die Lieferdaten.'],
  'Comenzile nu pot fi trimise momentan. Încearcă din nou mai târziu.': [
    'Orders cannot be sent at the moment. Please try again later.',
    'Los pedidos no se pueden enviar por el momento. Inténtalo de nuevo más tarde.',
    'Bestellungen können derzeit nicht gesendet werden. Versuche es später erneut.',
  ],
  'Emailul de confirmare nu a putut fi trimis.': [
    'The confirmation email could not be sent.',
    'No se ha podido enviar el correo de confirmación.',
    'Die Bestätigungs-E-Mail konnte nicht gesendet werden.',
  ],
  'Comanda a ajuns la noi.': ['Your order has reached us.', 'Tu pedido nos ha llegado.', 'Deine Bestellung ist bei uns angekommen.'],
  'Emailul de confirmare nu este încă activ, dar comanda a fost salvată.': [
    'The confirmation email is not active yet, but the order has been saved.',
    'El correo de confirmación aún no está activo, pero el pedido se ha guardado.',
    'Die Bestätigungs-E-Mail ist noch nicht aktiv, aber die Bestellung wurde gespeichert.',
  ],
  'Formularul de comandă nu este încă configurat.': [
    'The order form is not configured yet.',
    'El formulario de pedido aún no está configurado.',
    'Das Bestellformular ist noch nicht konfiguriert.',
  ],
  'Momente din activitatea firmei de exercițiu MKTech.': [
    'Moments from the activity of the MKTech training company.',
    'Momentos de la actividad de la empresa de prácticas MKTech.',
    'Momente aus der Arbeit der Übungsfirma MKTech.',
  ],
  'produse în coș': ['products in cart', 'productos en el carrito', 'Produkte im Warenkorb'],
  'produs în coș': ['product in cart', 'producto en el carrito', 'Produkt im Warenkorb'],
  'produse favorite': ['favorite products', 'productos favoritos', 'Lieblingsprodukte'],
  'produs favorit': ['favorite product', 'producto favorito', 'Lieblingsprodukt'],
  'Vezi favoritele': ['View favorites', 'Ver favoritos', 'Favoriten ansehen'],
};

/* Continuarea dicționarului: cont, contact, despre noi, noutăți, listă de prețuri, footer */
Object.assign(UI_DICT, {
  /* ----- Cont ----- */
  'Contul meu': ['My Account', 'Mi cuenta', 'Mein Konto'],
  'Contul meu MKTech': ['My MKTech account', 'Mi cuenta MKTech', 'Mein MKTech-Konto'],
  'Bine ai venit!': ['Welcome!', '¡Bienvenido!', 'Willkommen!'],
  'Autentifică-te sau creează un cont nou ca să vezi rapid coșul, favoritele și detaliile tale.': [
    'Sign in or create a new account to quickly see your cart, favorites and details.',
    'Inicia sesión o crea una cuenta nueva para ver rápidamente tu carrito, tus favoritos y tus datos.',
    'Melde dich an oder erstelle ein neues Konto, um Warenkorb, Favoriten und deine Daten schnell zu sehen.',
  ],
  'Produsele favorite, mereu la îndemână': ['Your favorite products, always at hand', 'Tus productos favoritos, siempre a mano', 'Deine Lieblingsprodukte, immer griffbereit'],
  'Coșul rămâne salvat între vizite': ['Your cart stays saved between visits', 'El carrito se guarda entre visitas', 'Der Warenkorb bleibt zwischen Besuchen gespeichert'],
  'Mesaj personalizat la finalizarea comenzii': ['A personalized message at checkout', 'Un mensaje personalizado al finalizar el pedido', 'Eine persönliche Nachricht beim Bestellabschluss'],
  'Autentificare': ['Sign in', 'Iniciar sesión', 'Anmelden'],
  'Autentifică-te': ['Sign in', 'Inicia sesión', 'Anmelden'],
  'Cont nou': ['New account', 'Cuenta nueva', 'Neues Konto'],
  'Autentificare sau cont nou': ['Sign in or new account', 'Iniciar sesión o cuenta nueva', 'Anmelden oder neues Konto'],
  'Email': ['Email', 'Correo electrónico', 'E-Mail'],
  'Parolă': ['Password', 'Contraseña', 'Passwort'],
  'Parolă (minimum 6 caractere)': ['Password (minimum 6 characters)', 'Contraseña (mínimo 6 caracteres)', 'Passwort (mindestens 6 Zeichen)'],
  'Arată parola': ['Show password', 'Mostrar contraseña', 'Passwort anzeigen'],
  'Ascunde parola': ['Hide password', 'Ocultar contraseña', 'Passwort verbergen'],
  'Intră în cont': ['Sign in', 'Entrar en la cuenta', 'Anmelden'],
  'Nu ai cont?': ['No account yet?', '¿No tienes cuenta?', 'Noch kein Konto?'],
  'Creează unul acum': ['Create one now', 'Crea una ahora', 'Jetzt eines erstellen'],
  'Ai deja cont?': ['Already have an account?', '¿Ya tienes cuenta?', 'Schon ein Konto?'],
  'Nume': ['Name', 'Nombre', 'Name'],
  'Prenume Nume': ['First name Last name', 'Nombre y apellidos', 'Vorname Nachname'],
  'Creează contul': ['Create account', 'Crear la cuenta', 'Konto erstellen'],
  'Cont demonstrativ.': ['Demo account.', 'Cuenta de demostración.', 'Demo-Konto.'],
  'Datele se salvează doar în acest browser (localStorage), necriptat — nu sunt sincronizate pe alte dispozitive. Nu folosi o parolă pe care o ai la alte conturi.': [
    'Data is saved only in this browser (localStorage), unencrypted — it is not synced to other devices. Do not use a password you use for other accounts.',
    'Los datos se guardan solo en este navegador (localStorage), sin cifrar: no se sincronizan con otros dispositivos. No uses una contraseña que tengas en otras cuentas.',
    'Die Daten werden nur in diesem Browser (localStorage) gespeichert, unverschlüsselt — sie werden nicht mit anderen Geräten synchronisiert. Verwende kein Passwort, das du für andere Konten nutzt.',
  ],
  'Detaliile contului': ['Account details', 'Datos de la cuenta', 'Kontodaten'],
  'Cont creat': ['Account created', 'Cuenta creada', 'Konto erstellt'],
  'Deconectare': ['Sign out', 'Cerrar sesión', 'Abmelden'],
  'Ești autentificat în contul tău MKTech.': ['You are signed in to your MKTech account.', 'Has iniciado sesión en tu cuenta MKTech.', 'Du bist in deinem MKTech-Konto angemeldet.'],
  'Te-ai deconectat': ['You have signed out', 'Has cerrado sesión', 'Du hast dich abgemeldet'],
  'Te așteptăm înapoi!': ['We hope to see you back!', '¡Te esperamos de vuelta!', 'Wir freuen uns auf deinen nächsten Besuch!'],
  'Te-ai autentificat cu succes.': ['You have signed in successfully.', 'Has iniciado sesión correctamente.', 'Du hast dich erfolgreich angemeldet.'],
  'Introdu adresa de email.': ['Enter your email address.', 'Introduce tu dirección de correo.', 'Gib deine E-Mail-Adresse ein.'],
  'Adresa de email nu este validă.': ['The email address is not valid.', 'La dirección de correo no es válida.', 'Die E-Mail-Adresse ist ungültig.'],
  'Introdu parola.': ['Enter your password.', 'Introduce tu contraseña.', 'Gib dein Passwort ein.'],
  'Introdu numele tău.': ['Enter your name.', 'Introduce tu nombre.', 'Gib deinen Namen ein.'],
  'Introdu numele tău (minimum 2 caractere).': ['Enter your name (minimum 2 characters).', 'Introduce tu nombre (mínimo 2 caracteres).', 'Gib deinen Namen ein (mindestens 2 Zeichen).'],
  'Parola trebuie să aibă cel puțin 6 caractere.': ['The password must be at least 6 characters long.', 'La contraseña debe tener al menos 6 caracteres.', 'Das Passwort muss mindestens 6 Zeichen lang sein.'],
  'Nu există niciun cont cu acest email.': ['There is no account with this email.', 'No existe ninguna cuenta con este correo.', 'Es gibt kein Konto mit dieser E-Mail.'],
  'Parola este incorectă.': ['The password is incorrect.', 'La contraseña es incorrecta.', 'Das Passwort ist falsch.'],
  'Există deja un cont cu acest email.': ['An account with this email already exists.', 'Ya existe una cuenta con este correo.', 'Es existiert bereits ein Konto mit dieser E-Mail.'],

  /* ----- Contact ----- */
  'Hai să vorbim': ['Let us talk', 'Hablemos', 'Sprechen wir'],
  'Contact MKTech': ['Contact MKTech', 'Contacto MKTech', 'Kontakt MKTech'],
  'Ai o întrebare despre un produs sau despre firma noastră? Scrie-ne prin formularul de mai jos sau folosește datele de contact.': [
    'Do you have a question about a product or about our company? Write to us using the form below or use the contact details.',
    '¿Tienes una pregunta sobre un producto o sobre nuestra empresa? Escríbenos con el formulario de abajo o usa los datos de contacto.',
    'Hast du eine Frage zu einem Produkt oder zu unserer Firma? Schreib uns über das Formular unten oder nutze die Kontaktdaten.',
  ],
  'Adresă': ['Address', 'Dirección', 'Adresse'],
  'Telefon': ['Phone', 'Teléfono', 'Telefon'],
  'Program': ['Opening hours', 'Horario', 'Öffnungszeiten'],
  'Trimite-ne un mesaj': ['Send us a message', 'Envíanos un mensaje', 'Schreib uns eine Nachricht'],
  'Completează câmpurile de mai jos și îți răspundem cât mai curând.': [
    'Fill in the fields below and we will reply as soon as possible.',
    'Rellena los campos siguientes y te responderemos lo antes posible.',
    'Fülle die Felder unten aus und wir antworten so schnell wie möglich.',
  ],
  'Mesaj': ['Message', 'Mensaje', 'Nachricht'],
  'Scrie mesajul tău aici…': ['Write your message here…', 'Escribe tu mensaje aquí…', 'Schreibe deine Nachricht hier…'],
  'Mesajul trebuie să aibă cel puțin 10 caractere.': ['The message must be at least 10 characters long.', 'El mensaje debe tener al menos 10 caracteres.', 'Die Nachricht muss mindestens 10 Zeichen lang sein.'],
  'Trimite mesajul': ['Send message', 'Enviar mensaje', 'Nachricht senden'],
  'Formular demonstrativ.': ['Demo form.', 'Formulario de demostración.', 'Demo-Formular.'],
  'Mesajele nu sunt încă trimise pe email — formularul verifică datele și afișează o confirmare simulată.': [
    'Messages are not sent by email yet — the form checks the data and shows a simulated confirmation.',
    'Los mensajes todavía no se envían por correo: el formulario comprueba los datos y muestra una confirmación simulada.',
    'Nachrichten werden noch nicht per E-Mail gesendet — das Formular prüft die Daten und zeigt eine simulierte Bestätigung.',
  ],
  'Mulțumim,': ['Thank you,', '¡Gracias,', 'Danke,'],
  'Mesajul tău a fost completat corect.': ['Your message was filled in correctly.', 'Tu mensaje se ha rellenado correctamente.', 'Deine Nachricht wurde korrekt ausgefüllt.'],
  'Simulare:': ['Simulation:', 'Simulación:', 'Simulation:'],
  'formularul nu este încă conectat la un serviciu de email, deci mesajul nu a fost trimis.': [
    'the form is not yet connected to an email service, so the message was not sent.',
    'el formulario aún no está conectado a un servicio de correo, por lo que el mensaje no se ha enviado.',
    'das Formular ist noch nicht mit einem E-Mail-Dienst verbunden, daher wurde die Nachricht nicht gesendet.',
  ],
  'Mesajul tău a fost trimis. Îți vom răspunde cât mai curând.': [
    'Your message has been sent. We will reply as soon as possible.',
    'Tu mensaje ha sido enviado. Te responderemos lo antes posible.',
    'Deine Nachricht wurde gesendet. Wir antworten so schnell wie möglich.',
  ],
  'Trimite alt mesaj': ['Send another message', 'Enviar otro mensaje', 'Weitere Nachricht senden'],
  'Mesajul nu a putut fi trimis': ['The message could not be sent', 'No se ha podido enviar el mensaje', 'Die Nachricht konnte nicht gesendet werden'],
  'Verifică conexiunea la internet și încearcă din nou.': ['Check your internet connection and try again.', 'Comprueba tu conexión a internet e inténtalo de nuevo.', 'Prüfe deine Internetverbindung und versuche es erneut.'],
  'Unde ne găsești': ['Where to find us', 'Dónde encontrarnos', 'Wo du uns findest'],
  'Situare geografică': ['Location', 'Ubicación', 'Standort'],
  'Adresa completă': ['Full address', 'Dirección completa', 'Vollständige Adresse'],

  /* ----- Despre noi & organigramă ----- */
  'Cunoaște MKTech': ['Get to know MKTech', 'Conoce MKTech', 'Lerne MKTech kennen'],
  'Povestea noastră': ['Our story', 'Nuestra historia', 'Unsere Geschichte'],
  'Cum a început MKTech': ['How MKTech started', 'Cómo empezó MKTech', 'Wie MKTech begann'],
  'Anul înființării': ['Year founded', 'Año de fundación', 'Gründungsjahr'],
  'Produse în catalog': ['Products in the catalog', 'Productos en el catálogo', 'Produkte im Katalog'],
  'Categorii de produse': ['Product categories', 'Categorías de productos', 'Produktkategorien'],
  'Misiune și valori': ['Mission and values', 'Misión y valores', 'Mission und Werte'],
  'Ce ne ghidează': ['What guides us', 'Lo que nos guía', 'Was uns leitet'],
  'Misiunea noastră': ['Our mission', 'Nuestra misión', 'Unsere Mission'],
  'Echipa': ['The team', 'El equipo', 'Das Team'],
  'Oamenii din spatele MKTech': ['The people behind MKTech', 'Las personas detrás de MKTech', 'Die Menschen hinter MKTech'],
  'Structura firmei': ['Company structure', 'Estructura de la empresa', 'Unternehmensstruktur'],
  'Organigramă': ['Organizational chart', 'Organigrama', 'Organigramm'],
  'Cum este organizată echipa MKTech, pe departamente.': [
    'How the MKTech team is organized, by department.',
    'Cómo está organizado el equipo de MKTech, por departamentos.',
    'Wie das MKTech-Team nach Abteilungen organisiert ist.',
  ],

  /* ----- Noutăți ----- */
  'Noutăți MKTech': ['MKTech News', 'Noticias MKTech', 'MKTech Neuigkeiten'],
  'Ce mai e nou la MKTech': ['What is new at MKTech', 'Novedades en MKTech', 'Was gibt es Neues bei MKTech'],
  'Anunțuri despre produse, participări la târguri și activitatea firmei noastre de exercițiu.': [
    'Announcements about products, trade fair participations and the activity of our training company.',
    'Anuncios sobre productos, participación en ferias y la actividad de nuestra empresa de prácticas.',
    'Ankündigungen zu Produkten, Messeteilnahmen und der Arbeit unserer Übungsfirma.',
  ],
  'Nicio noutate deocamdată': ['No news yet', 'Todavía no hay noticias', 'Noch keine Neuigkeiten'],
  'Revino curând: aici vom publica noutățile firmei MKTech.': [
    'Come back soon: we will publish MKTech news here.',
    'Vuelve pronto: aquí publicaremos las novedades de MKTech.',
    'Schau bald wieder vorbei: Hier veröffentlichen wir die Neuigkeiten von MKTech.',
  ],
  'Vezi produsele': ['See the products', 'Ver los productos', 'Produkte ansehen'],

  /* ----- Listă de prețuri ----- */
  'Listă de prețuri': ['Price list', 'Lista de precios', 'Preisliste'],
  'Toate cele 30 de produse MKTech, grupate pe categorii. Prețurile sunt exprimate în lei, cu TVA inclus.': [
    'All 30 MKTech products, grouped by category. Prices are in lei (RON), VAT included.',
    'Los 30 productos de MKTech, agrupados por categorías. Los precios están en lei (RON), IVA incluido.',
    'Alle 30 MKTech-Produkte, nach Kategorien gruppiert. Preise in Lei (RON), inkl. MwSt.',
  ],
  'Printează lista': ['Print the list', 'Imprimir la lista', 'Liste drucken'],
  'Produs': ['Product', 'Producto', 'Produkt'],
  'Cod produs': ['Product code', 'Código de producto', 'Produktnummer'],
  'Cod produs:': ['Product code:', 'Código de producto:', 'Produktnummer:'],
  'Preț': ['Price', 'Precio', 'Preis'],

  /* ----- Footer ----- */
  'Companie': ['Company', 'Empresa', 'Unternehmen'],
  'Categorii': ['Categories', 'Categorías', 'Kategorien'],
  'Echipamente IT și de birou: monitoare, periferice, unități PC, laptopuri, consumabile și rechizite.': [
    'IT and office equipment: monitors, peripherals, desktop PCs, laptops, supplies and consumables.',
    'Equipos informáticos y de oficina: monitores, periféricos, ordenadores de sobremesa, portátiles, consumibles y material de oficina.',
    'IT- und Büroausstattung: Monitore, Peripheriegeräte, Desktop-PCs, Laptops, Verbrauchsmaterial und Bürobedarf.',
  ],
  'Autentificare / cont': ['Sign in / account', 'Iniciar sesión / cuenta', 'Anmelden / Konto'],
  'Magazin demonstrativ: comenzile și plățile sunt simulate.': [
    'Demo shop: orders and payments are simulated.',
    'Tienda de demostración: los pedidos y los pagos son simulados.',
    'Demo-Shop: Bestellungen und Zahlungen sind simuliert.',
  ],
});

/* Etichetele și valorile din tabelul „Specificații tehnice”.
   Denumirile tehnice (Intel Core i5, Full HD, RTX 5080, Windows 11 Pro etc.)
   rămân la fel în toate limbile, deci nu apar aici. */
Object.assign(UI_DICT, {
  /* etichete */
  'Accesorii incluse': ['Included accessories', 'Accesorios incluidos', 'Mitgeliefertes Zubehör'],
  'Alimentare prin USB-C': ['USB-C power delivery', 'Alimentación por USB-C', 'Stromversorgung über USB-C'],
  'Amplificatoare compatibile': ['Compatible amplifiers', 'Amplificadores compatibles', 'Kompatible Verstärker'],
  'An': ['Year', 'Año', 'Jahr'],
  'Audio': ['Audio', 'Audio', 'Audio'],
  'Brand': ['Brand', 'Marca', 'Marke'],
  'Butoane': ['Buttons', 'Botones', 'Tasten'],
  'Cameră': ['Camera', 'Cámara', 'Kamera'],
  'Cantitate': ['Quantity', 'Cantidad', 'Menge'],
  'Clasă': ['Class', 'Clase', 'Klasse'],
  'Compatibilitate': ['Compatibility', 'Compatibilidad', 'Kompatibilität'],
  'Conectare': ['Connection', 'Conexión', 'Anschluss'],
  'Conectivitate': ['Connectivity', 'Conectividad', 'Konnektivität'],
  'Confidențialitate': ['Privacy', 'Privacidad', 'Privatsphäre'],
  'Configurație': ['Configuration', 'Configuración', 'Konfiguration'],
  'Coperți': ['Covers', 'Tapas', 'Einbände'],
  'Culoare': ['Color', 'Color', 'Farbe'],
  'Design': ['Design', 'Diseño', 'Design'],
  'Diagonală': ['Screen size', 'Tamaño de pantalla', 'Bildschirmdiagonale'],
  'Diametru': ['Diameter', 'Diámetro', 'Durchmesser'],
  'Durabilitate': ['Durability', 'Durabilidad', 'Robustheit'],
  'Duritate': ['Hardness', 'Dureza', 'Härte'],
  'Ecran': ['Display', 'Pantalla', 'Display'],
  'Export': ['Export', 'Exportación', 'Export'],
  'Față-verso': ['Double-sided printing', 'Impresión a doble cara', 'Duplexdruck'],
  'Format': ['Format', 'Formato', 'Format'],
  'Format carcasă': ['Case format', 'Formato de la caja', 'Gehäuseformat'],
  'Format documente': ['Document format', 'Formato de documentos', 'Dokumentformat'],
  'Funcție OCR': ['OCR function', 'Función OCR', 'OCR-Funktion'],
  'Funcții AI': ['AI features', 'Funciones de IA', 'KI-Funktionen'],
  'Garanție': ['Warranty', 'Garantía', 'Garantie'],
  'Gramaj': ['Paper weight', 'Gramaje', 'Grammatur'],
  'Grosime': ['Thickness', 'Grosor', 'Stärke'],
  'Grosime vârf': ['Tip width', 'Grosor de la punta', 'Strichstärke'],
  'HDR': ['HDR', 'HDR', 'HDR'],
  'Iluminare': ['Lighting', 'Iluminación', 'Beleuchtung'],
  'Lumină': ['Light', 'Luz', 'Licht'],
  'Material': ['Material', 'Material', 'Material'],
  'Memorie RAM': ['RAM', 'Memoria RAM', 'Arbeitsspeicher'],
  'Microfoane': ['Microphones', 'Micrófonos', 'Mikrofone'],
  'Model': ['Model', 'Modelo', 'Modell'],
  'Montare': ['Mounting', 'Montaje', 'Montage'],
  'Pachet': ['Package', 'Paquete', 'Paket'],
  'Placă video': ['Graphics card', 'Tarjeta gráfica', 'Grafikkarte'],
  'Porturi': ['Ports', 'Puertos', 'Anschlüsse'],
  'Procesor': ['Processor', 'Procesador', 'Prozessor'],
  'Protecția ochilor': ['Eye protection', 'Protección ocular', 'Augenschutz'],
  'Rată de reîmprospătare': ['Refresh rate', 'Tasa de refresco', 'Bildwiederholrate'],
  'Rezoluție': ['Resolution', 'Resolución', 'Auflösung'],
  'Rezoluție video': ['Video resolution', 'Resolución de vídeo', 'Videoauflösung'],
  'Securitate': ['Security', 'Seguridad', 'Sicherheit'],
  'Senzor': ['Sensor', 'Sensor', 'Sensor'],
  'Sincronizare': ['Synchronization', 'Sincronización', 'Synchronisation'],
  'Sistem de operare': ['Operating system', 'Sistema operativo', 'Betriebssystem'],
  'Socket': ['Socket', 'Socket', 'Sockel'],
  'Stocare': ['Storage', 'Almacenamiento', 'Speicher'],
  'Suport': ['Stand', 'Soporte', 'Standfuß'],
  'Switch-uri': ['Switches', 'Switches', 'Switches'],
  'Tastatură': ['Keyboard', 'Teclado', 'Tastatur'],
  'Tavă hârtie': ['Paper tray', 'Bandeja de papel', 'Papierfach'],
  'Timp de răspuns': ['Response time', 'Tiempo de respuesta', 'Reaktionszeit'],
  'Timp de scanare': ['Scanning time', 'Tiempo de escaneo', 'Scandauer'],
  'Tip': ['Type', 'Tipo', 'Typ'],
  'Tip ecran': ['Screen type', 'Tipo de pantalla', 'Bildschirmtyp'],
  'Tip panou': ['Panel type', 'Tipo de panel', 'Panel-Typ'],
  'Tweeter': ['Tweeter', 'Tweeter', 'Hochtöner'],
  'Unghiuri de vizualizare': ['Viewing angles', 'Ángulos de visión', 'Betrachtungswinkel'],
  'Utilizare': ['Use', 'Uso', 'Verwendung'],
  'Viteză de imprimare': ['Print speed', 'Velocidad de impresión', 'Druckgeschwindigkeit'],
  'Vârstă recomandată': ['Recommended age', 'Edad recomendada', 'Empfohlenes Alter'],
  'Wireless': ['Wireless', 'Inalámbrico', 'Kabellos'],
  'Woofer': ['Woofer', 'Woofer', 'Tieftöner'],
  'Închidere': ['Closure', 'Cierre', 'Verschluss'],

  /* valori */
  'Da': ['Yes', 'Sí', 'Ja'],
  'Ergonomic, reglabil': ['Ergonomic, adjustable', 'Ergonómico, ajustable', 'Ergonomisch, verstellbar'],
  'Ergonomic': ['Ergonomic', 'Ergonómico', 'Ergonomisch'],
  '36 luni': ['36 months', '36 meses', '36 Monate'],
  '24 luni': ['24 months', '24 meses', '24 Monate'],
  'Largi': ['Wide', 'Amplios', 'Weit'],
  'Compatibil VESA': ['VESA compatible', 'Compatible con VESA', 'VESA-kompatibel'],
  'Curbat': ['Curved', 'Curvo', 'Gebogen'],
  'Difuzoare integrate': ['Built-in speakers', 'Altavoces integrados', 'Integrierte Lautsprecher'],
  'Până la 70W': ['Up to 70W', 'Hasta 70 W', 'Bis zu 70 W'],
  'Tastatură mecanică gaming': ['Mechanical gaming keyboard', 'Teclado mecánico gaming', 'Mechanische Gaming-Tastatur'],
  'RGB personalizabilă': ['Customizable RGB', 'RGB personalizable', 'Anpassbares RGB'],
  'Mouse gaming wireless': ['Wireless gaming mouse', 'Ratón gaming inalámbrico', 'Kabellose Gaming-Maus'],
  'Optic, până la 30.000 DPI': ['Optical, up to 30,000 DPI', 'Óptico, hasta 30.000 DPI', 'Optisch, bis zu 30.000 DPI'],
  '11 programabile': ['11 programmable', '11 programables', '11 programmierbare'],
  'Imprimantă laser monocromă': ['Monochrome laser printer', 'Impresora láser monocromo', 'Monochrom-Laserdrucker'],
  'Până la 28 pagini/minut': ['Up to 28 pages/minute', 'Hasta 28 páginas/minuto', 'Bis zu 28 Seiten/Minute'],
  'Automată': ['Automatic', 'Automática', 'Automatisch'],
  '250 de coli': ['250 sheets', '250 hojas', '250 Blatt'],
  'Scanner portabil': ['Portable scanner', 'Escáner portátil', 'Tragbarer Scanner'],
  'Sub o secundă': ['Under one second', 'Menos de un segundo', 'Unter einer Sekunde'],
  'LED integrată': ['Built-in LED', 'LED integrada', 'Integrierte LED'],
  'Corecție automată': ['Automatic correction', 'Corrección automática', 'Automatische Korrektur'],
  'Cu reducerea zgomotului': ['With noise reduction', 'Con reducción de ruido', 'Mit Geräuschunterdrückung'],
  'Capac integrat': ['Built-in shutter', 'Tapa integrada', 'Integrierte Abdeckung'],
  'Grafit': ['Graphite', 'Grafito', 'Graphit'],
  'Boxe de raft': ['Bookshelf speakers', 'Altavoces de estantería', 'Regallautsprecher'],
  '2 boxe (x2)': ['2 speakers (x2)', '2 altavoces (x2)', '2 Lautsprecher (x2)'],
  'Tastatură și mouse': ['Keyboard and mouse', 'Teclado y ratón', 'Tastatur und Maus'],
  'Apple M1 (8 nuclee)': ['Apple M1 (8 cores)', 'Apple M1 (8 núcleos)', 'Apple M1 (8 Kerne)'],
  'GPU cu 7 nuclee': ['7-core GPU', 'GPU de 7 núcleos', 'GPU mit 7 Kernen'],
  'Integrate': ['Built-in', 'Integradas', 'Integriert'],
  'Certificare MIL-STD-810H': ['MIL-STD-810H certified', 'Certificación MIL-STD-810H', 'MIL-STD-810H-Zertifizierung'],
  '15,6" Full HD mat': ['15.6" matte Full HD', '15,6" Full HD mate', '15,6" Full HD matt'],
  'AMD Radeon (integrată)': ['AMD Radeon (integrated)', 'AMD Radeon (integrada)', 'AMD Radeon (integriert)'],
  'Până la 16 GB': ['Up to 16 GB', 'Hasta 16 GB', 'Bis zu 16 GB'],
  'SSD de până la 1 TB': ['SSD up to 1 TB', 'SSD de hasta 1 TB', 'SSD bis zu 1 TB'],
  'Argintiu': ['Silver', 'Plateado', 'Silber'],
  '15,3" IPS, înaltă rezoluție': ['15.3" IPS, high resolution', '15,3" IPS, alta resolución', '15,3" IPS, hohe Auflösung'],
  'Iluminată': ['Backlit', 'Retroiluminado', 'Beleuchtet'],
  '15,6" Full HD IPS': ['15.6" Full HD IPS', '15,6" Full HD IPS', '15,6" Full HD IPS'],
  'Intel Celeron N5095 (4 nuclee)': ['Intel Celeron N5095 (4 cores)', 'Intel Celeron N5095 (4 núcleos)', 'Intel Celeron N5095 (4 Kerne)'],
  'Cititor de amprentă': ['Fingerprint reader', 'Lector de huellas', 'Fingerabdrucksensor'],
  '500 coli/top': ['500 sheets/ream', '500 hojas/paquete', '500 Blatt/Paket'],
  'Imprimante inkjet și laser, copiatoare, faxuri': [
    'Inkjet and laser printers, copiers, fax machines',
    'Impresoras de inyección de tinta y láser, copiadoras, faxes',
    'Tintenstrahl- und Laserdrucker, Kopierer, Faxgeräte',
  ],
  'Albastru': ['Blue', 'Azul', 'Blau'],
  'Plastic': ['Plastic', 'Plástico', 'Kunststoff'],
  'Peste 6 ani': ['Over 6 years', 'Más de 6 años', 'Ab 6 Jahren'],
  '50 buc': ['50 pcs', '50 uds.', '50 Stück'],
  '6 buc': ['6 pcs', '6 uds.', '6 Stück'],
  '2B (mină moale)': ['2B (soft lead)', '2B (mina blanda)', '2B (weiche Mine)'],
  'Scriere, desen, schițe': ['Writing, drawing, sketching', 'Escritura, dibujo, bocetos', 'Schreiben, Zeichnen, Skizzieren'],
  'Set caiete': ['Notebook set', 'Set de cuadernos', 'Heft-Set'],
  'Culori variate': ['Assorted colors', 'Colores variados', 'Verschiedene Farben'],
  'Școală, facultate, birou': ['School, university, office', 'Escuela, universidad, oficina', 'Schule, Studium, Büro'],
  'Capsă': ['Snap fastener', 'Broche', 'Druckknopf'],
  '5 mape': ['5 folders', '5 carpetas', '5 Mappen'],
  '5-pack (multipack)': ['5-pack (multipack)', 'Pack de 5 (multipack)', '5er-Pack (Multipack)'],
  'Imprimante Canon': ['Canon printers', 'Impresoras Canon', 'Canon-Drucker'],
  'Cartușe cu cerneală': ['Ink cartridges', 'Cartuchos de tinta', 'Tintenpatronen'],
  'Multi-monitor': ['Multi-monitor', 'Multimonitor', 'Multi-Monitor'],
  'Alb': ['White', 'Blanco', 'Weiß'],
});

/* Texte care conțin numere sau cuvinte variabile (nu pot sta ca atare în dicționar) */
const UI_PATTERNS = [
  { re: /^(\d+) produse$/, en: '$1 products', es: '$1 productos', de: '$1 Produkte' },
  { re: /^(\d+) produs$/, en: '$1 product', es: '$1 producto', de: '$1 Produkt' },
  { re: /^(\d+) produse găsite$/, en: '$1 products found', es: '$1 productos encontrados', de: '$1 Produkte gefunden' },
  { re: /^(\d+) produs găsit$/, en: '$1 product found', es: '$1 producto encontrado', de: '$1 Produkt gefunden' },
  { re: /^(\d+) buc\.$/, en: '$1 pcs.', es: '$1 uds.', de: '$1 Stk.' },
  { re: /^(\d+) produse în coș$/, en: '$1 products in cart', es: '$1 productos en el carrito', de: '$1 Produkte im Warenkorb' },
  { re: /^(\d+) produs în coș$/, en: '$1 product in cart', es: '$1 producto en el carrito', de: '$1 Produkt im Warenkorb' },
  { re: /^(\d+) produse favorite$/, en: '$1 favorite products', es: '$1 productos favoritos', de: '$1 Lieblingsprodukte' },
  { re: /^(\d+) produs favorit$/, en: '$1 favorite product', es: '$1 producto favorito', de: '$1 Lieblingsprodukt' },
  { re: /^Adaugă la favorite: (.+)$/, en: 'Add to favorites: $1', es: 'Añadir a favoritos: $1', de: 'Zu Favoriten hinzufügen: $1' },
  { re: /^Elimină de la favorite: (.+)$/, en: 'Remove from favorites: $1', es: 'Quitar de favoritos: $1', de: 'Aus Favoriten entfernen: $1' },
  { re: /^Șterge din coș: (.+)$/, en: 'Remove from cart: $1', es: 'Eliminar del carrito: $1', de: 'Aus dem Warenkorb entfernen: $1' },
  { re: /^Cantitate pentru (.+)$/, en: 'Quantity for $1', es: 'Cantidad para $1', de: 'Menge für $1' },
  { re: /^(.+) — imaginea (\d+)$/, en: '$1 — image $2', es: '$1 — imagen $2', de: '$1 — Bild $2' },
  { re: /^Arată imaginea (\d+)$/, en: 'Show image $1', es: 'Mostrar imagen $1', de: 'Bild $1 anzeigen' },
  { re: /^Arată bannerul (\d+)$/, en: 'Show banner $1', es: 'Mostrar banner $1', de: 'Banner $1 anzeigen' },
  { re: /^(\d+) din (\d+)$/, en: '$1 of $2', es: '$1 de $2', de: '$1 von $2' },
  { re: /^Alte produse din (.+)$/, en: 'More products in $1', es: 'Más productos de $1', de: 'Weitere Produkte in $1' },
  { re: /^Economisești (.+) \(-(\d+)%\)$/, en: 'You save $1 (-$2%)', es: 'Ahorras $1 (-$2%)', de: 'Du sparst $1 (-$2%)' },
  { re: /^Salut, (.+)!$/, en: 'Hello, $1!', es: '¡Hola, $1!', de: 'Hallo, $1!' },
  {
    re: /^Comanda (.+) a fost înregistrată\.$/,
    en: 'Order $1 has been registered.',
    es: 'El pedido $1 ha sido registrado.',
    de: 'Bestellung $1 wurde erfasst.',
  },
  { re: /^Mulțumim, (.+)!$/, en: 'Thank you, $1!', es: '¡Gracias, $1!', de: 'Danke, $1!' },
  {
    re: /^Mulțumim, (.+)! Mai jos găsești detaliile comenzii\.$/,
    en: 'Thank you, $1! You will find the order details below.',
    es: '¡Gracias, $1! A continuación encontrarás los detalles del pedido.',
    de: 'Danke, $1! Unten findest du die Bestelldetails.',
  },
  { re: /^Autentificat ca (.+)$/, en: 'Signed in as $1', es: 'Sesión iniciada como $1', de: 'Angemeldet als $1' },
  { re: /^Bine ai venit, (.+)!$/, en: 'Welcome, $1!', es: '¡Bienvenido, $1!', de: 'Willkommen, $1!' },
  { re: /^MKTech pe (.+)$/, en: 'MKTech on $1', es: 'MKTech en $1', de: 'MKTech auf $1' },
  { re: /^produse găsite pentru „(.+)”$/, en: 'products found for “$1”', es: 'productos encontrados para «$1»', de: 'Produkte gefunden für „$1“' },
  { re: /^produs găsit pentru „(.+)”$/, en: 'product found for “$1”', es: 'producto encontrado para «$1»', de: 'Produkt gefunden für „$1“' },
  { re: /^pentru „(.+)”\.$/, en: 'for “$1”.', es: 'para «$1».', de: 'für „$1“.' },
  { re: /^Ultima actualizare: (.+)$/, en: 'Last updated: $1', es: 'Última actualización: $1', de: 'Letzte Aktualisierung: $1' },
  {
    re: /^Proiect firmă de exercițiu — MKTech © (\d+)$/,
    en: 'Student training company project — MKTech © $1',
    es: 'Proyecto de empresa de prácticas — MKTech © $1',
    de: 'Schulprojekt (Übungsfirma) — MKTech © $1',
  },
  {
    re: /^MKTech — Listă de prețuri · (.+)$/,
    en: 'MKTech — Price list · $1',
    es: 'MKTech — Lista de precios · $1',
    de: 'MKTech — Preisliste · $1',
  },
];

/* Atributele traduse automat (pe lângă textul propriu-zis al paginii) */
const TRANSLATED_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const NO_TRANSLATE_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);

/* Aceleași texte, dar cu spațiile normalizate — ca să se potrivească și textele
   scrise pe mai multe rânduri în HTML */
const UI_DICT_LOOKUP = {};
Object.keys(UI_DICT).forEach((key) => {
  UI_DICT_LOOKUP[key.replace(/\s+/g, ' ').trim()] = UI_DICT[key];
});

/* Traduce un text; întoarce null dacă nu există traducere (rămâne în română) */
function translateString(text) {
  if (CURRENT_LANG === 'ro' || !text) return null;
  const key = text.replace(/\s+/g, ' ').trim();
  if (!key || key.length > 600) return null;
  if (key.endsWith(' *')) {
    const fara = translateString(key.slice(0, -2));
    return fara === null ? null : `${fara} *`;
  }
  const entry = UI_DICT_LOOKUP[key];
  if (entry) return entry[LANG_INDEX[CURRENT_LANG]] || null;
  for (const rule of UI_PATTERNS) {
    const match = key.match(rule.re);
    if (match) return rule[CURRENT_LANG].replace(/\$(\d)/g, (_, i) => match[Number(i)]);
  }
  return null;
}

function translateTextNode(node) {
  const raw = node.nodeValue;
  const translated = translateString(raw);
  if (translated === null) return;
  const next = raw.replace(raw.trim(), translated);
  if (next !== raw) node.nodeValue = next;
}

function translateElementAttrs(el) {
  TRANSLATED_ATTRS.forEach((attr) => {
    if (!el.hasAttribute(attr)) return;
    const value = el.getAttribute(attr);
    const translated = translateString(value);
    if (translated !== null && translated !== value) el.setAttribute(attr, translated);
  });
}

/* Traduce tot ce se află într-o zonă a paginii (implicit: toată pagina) */
function translateDOM(root = document.body) {
  if (CURRENT_LANG === 'ro' || !root) return;
  if (root.nodeType === 3) {
    translateTextNode(root);
    return;
  }
  if (root.nodeType !== 1) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentNode && NO_TRANSLATE_TAGS.has(node.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(translateTextNode);

  translateElementAttrs(root);
  $$('*', root).forEach(translateElementAttrs);
}

/* Titlul din tab-ul browserului (ex. „Catalog produse | MKTech”) */
function translateDocumentTitle() {
  if (CURRENT_LANG === 'ro') return;
  document.title = document.title
    .split('|')
    .map((part) => translateString(part) || part.trim())
    .join(' | ');
}

/* Conținutul adăugat ulterior de JS (coș, notificări, rezultate căutare...)
   este tradus automat, pe măsură ce apare în pagină. */
function watchNewContent() {
  if (CURRENT_LANG === 'ro' || !('MutationObserver' in window)) return;
  const config = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: TRANSLATED_ATTRS };
  const observer = new MutationObserver((records) => {
    observer.disconnect(); // evităm ca propriile modificări să declanșeze o buclă
    records.forEach((record) => {
      if (record.type === 'childList') record.addedNodes.forEach((node) => translateDOM(node));
      else if (record.type === 'characterData') translateTextNode(record.target);
      else if (record.type === 'attributes') translateElementAttrs(record.target);
    });
    observer.observe(document.body, config);
  });
  observer.observe(document.body, config);
}

function applyLanguage() {
  document.documentElement.lang = CURRENT_LANG;
  translateDocumentTitle();
  translateDOM(document.body);
  watchNewContent();
}

/* Schimbarea limbii reîncarcă pagina, ca absolut tot conținutul
   (inclusiv coșul sau pagina de produs) să fie randat în limba nouă. */
function setLanguage(code) {
  if (!LANGS.some((l) => l.code === code) || code === CURRENT_LANG) return;
  storage.set(STORAGE_KEYS.lang, code);
  window.location.reload();
}

/* Numele produsului și descrierea, în limba curentă (cu revenire la română) */
function productName(p) {
  return p[`name_${CURRENT_LANG}`] || p.name;
}

function productDescription(p) {
  return p[`description_${CURRENT_LANG}`] || p.description;
}

/* Numele categoriei, tradus prin același dicționar */
function categoryName(cat, short = false) {
  const value = short && cat.shortName ? cat.shortName : cat.name;
  return translateString(value) || value;
}

/* Textele scrise între paranteze drepte, ex. [Nume Prenume], sunt afișate
   evidențiat (fundal galben), ca să se vadă că mai trebuie completate */
function fillText(text) {
  const safe = escapeHTML(text);
  return /^\[.*\]$/.test(String(text).trim()) ? `<span class="placeholder">${safe}</span>` : safe;
}

/* Text din datele completate de Robert (organigramă, noutăți):
   ia varianta pe limbă, dacă există (ex. rol_en), altfel pe cea română */
function localizedField(obj, field) {
  return obj[`${field}_${CURRENT_LANG}`] || obj[field];
}

/* =====================================================================
   2. CATEGORII & CATALOG PRODUSE
   ===================================================================== */
const CATEGORIES = [
  { id: 'monitoare', name: 'Monitoare', singular: 'Monitor', icon: 'monitor' },
  { id: 'periferice', name: 'Periferice', singular: 'Periferic', icon: 'mouse' },
  { id: 'unitati', name: 'Unități', singular: 'Unitate PC', icon: 'cpu' },
  { id: 'laptopuri', name: 'Laptopuri', singular: 'Laptop', icon: 'laptop' },
  { id: 'consumabile', name: 'Consumabile și rechizite', shortName: 'Consumabile', singular: 'Consumabil', icon: 'pen' },
];

/* Fiecare produs:
   id          → folosit în URL (produs.html?id=monitor-1)
   img         → prefixul pozelor: 'monitor1' → monitor1(1).png ... monitor1(4).png
   price       → prețul real din catalog (lei)
   oldPrice    → DOAR la cele 5 produse cu reducere (preț vechi tăiat)
   specs       → specificații extrase din descriere/nume */
const PRODUCTS = [
  /* ---------- MONITOARE ---------- */
  {
    id: 'monitor-1', cod: 'MK-MON-01', category: 'monitoare', img: 'monitor1', price: 699,
    name: `LED Philips 275S1AE de 27 inchi`,
    description: `Monitor IPS de 27" cu rezoluție QHD (2560×1440), ideal pentru muncă și divertisment. Oferă imagini clare, tehnologie Adaptive-Sync pentru fluiditate, protecție pentru ochi prin TUV Eye Comfort și suport ergonomic reglabil. Garanție 36 luni.`,
    name_en: `Philips 275S1AE 27-inch LED Monitor`,
    description_en: `27-inch IPS monitor with QHD resolution (2560×1440), ideal for work and entertainment. Delivers sharp images, Adaptive-Sync technology for smooth motion, TUV Eye Comfort eye protection, and an adjustable ergonomic stand. 36-month warranty.`,
    name_es: `Monitor LED Philips 275S1AE de 27 pulgadas`,
    description_es: `Monitor IPS de 27" con resolución QHD (2560×1440), ideal para el trabajo y el entretenimiento. Ofrece imágenes nítidas, tecnología Adaptive-Sync para mayor fluidez, protección ocular TUV Eye Comfort y soporte ergonómico ajustable. Garantía de 36 meses.`,
    name_de: `Philips 275S1AE LED-Monitor, 27 Zoll`,
    description_de: `27-Zoll-IPS-Monitor mit QHD-Auflösung (2560×1440), ideal für Arbeit und Unterhaltung. Bietet klare Bilder, Adaptive-Sync-Technologie für flüssige Darstellung, TUV Eye Comfort Augenschutz und einen ergonomisch verstellbaren Standfuß. 36 Monate Garantie.`,
    specs: [['Diagonală', '27"'], ['Tip panou', 'IPS'], ['Rezoluție', 'QHD (2560×1440)'], ['Sincronizare', 'Adaptive-Sync'], ['Protecția ochilor', 'TUV Eye Comfort'], ['Suport', 'Ergonomic, reglabil'], ['Garanție', '36 luni']],
  },
  {
    id: 'monitor-2', cod: 'MK-MON-02', category: 'monitoare', img: 'monitor2', price: 750, oldPrice: 899,
    name: `LED Philips 24" 24B2N2200 24B2N2200/00`,
    description: `Monitor PHILIPS de 23,8” Full HD cu rată de reîmprospătare de 120 Hz, ideal pentru birou și utilizare zilnică. Oferă imagini clare, unghiuri largi de vizualizare, consum redus de energie și compatibilitate VESA pentru montare ușoară. Garanție 24 luni.`,
    name_en: `Philips 24" 24B2N2200 LED Monitor`,
    description_en: `23.8-inch Full HD PHILIPS monitor with a 120 Hz refresh rate, ideal for office and everyday use. Delivers clear images, wide viewing angles, low power consumption, and VESA compatibility for easy mounting. 24-month warranty.`,
    name_es: `Monitor LED Philips de 24" 24B2N2200`,
    description_es: `Monitor PHILIPS Full HD de 23,8" con una tasa de refresco de 120 Hz, ideal para la oficina y el uso diario. Ofrece imágenes nítidas, amplios ángulos de visión, bajo consumo de energía y compatibilidad VESA para un montaje sencillo. Garantía de 24 meses.`,
    name_de: `Philips 24" 24B2N2200 LED-Monitor`,
    description_de: `23,8-Zoll-Full-HD-Monitor von PHILIPS mit 120-Hz-Bildwiederholrate, ideal für Büro und Alltag. Bietet klare Bilder, breite Betrachtungswinkel, geringen Energieverbrauch und VESA-Kompatibilität für einfache Montage. 24 Monate Garantie.`,
    specs: [['Diagonală', '23,8"'], ['Rezoluție', 'Full HD'], ['Rată de reîmprospătare', '120 Hz'], ['Unghiuri de vizualizare', 'Largi'], ['Montare', 'Compatibil VESA'], ['Garanție', '24 luni']],
  },
  {
    id: 'monitor-3', cod: 'MK-MON-03', category: 'monitoare', img: 'monitor3', price: 889,
    name: `Acer/SA243YGOwi/23.8"/IPS/FHD/120Hz/1ms/Alb`,
    description: `Monitor ACER de 23,8” Full HD cu rată de reîmprospătare de 120 Hz și timp de răspuns de 1 ms, oferind imagini fluide și clare. Ideal pentru acasă sau birou, cu unghiuri largi de vizualizare și design modern, compatibil cu montare VESA. Garanție 24 luni.`,
    name_en: `Acer SA243YGOwi 23.8" IPS FHD 120Hz 1ms White Monitor`,
    description_en: `23.8-inch Full HD ACER monitor with a 120 Hz refresh rate and 1 ms response time, delivering smooth, clear images. Ideal for home or office, with wide viewing angles, a modern design, and VESA mount compatibility. 24-month warranty.`,
    name_es: `Monitor Acer SA243YGOwi de 23,8" IPS FHD 120Hz 1ms Blanco`,
    description_es: `Monitor ACER Full HD de 23,8" con una tasa de refresco de 120 Hz y un tiempo de respuesta de 1 ms, que ofrece imágenes fluidas y nítidas. Ideal para el hogar o la oficina, con amplios ángulos de visión y un diseño moderno, compatible con montaje VESA. Garantía de 24 meses.`,
    name_de: `Acer SA243YGOwi 23,8" IPS FHD 120Hz 1ms Weiß Monitor`,
    description_de: `23,8-Zoll-Full-HD-Monitor von ACER mit 120-Hz-Bildwiederholrate und 1 ms Reaktionszeit für flüssige, klare Bilder. Ideal für Zuhause oder Büro, mit breiten Betrachtungswinkeln, modernem Design und VESA-Montagekompatibilität. 24 Monate Garantie.`,
    specs: [['Diagonală', '23,8"'], ['Tip panou', 'IPS'], ['Rezoluție', 'Full HD'], ['Rată de reîmprospătare', '120 Hz'], ['Timp de răspuns', '1 ms'], ['Culoare', 'Alb'], ['Montare', 'Compatibil VESA'], ['Garanție', '24 luni']],
  },
  {
    id: 'monitor-4', cod: 'MK-MON-04', category: 'monitoare', img: 'monitor4', price: 1069,
    name: `Samsung Odyssey G5 C34G55TWWP Monitor`,
    description: `Monitor curbat Samsung Odyssey G5 de 34” cu rezoluție Ultra WQHD, rată de reîmprospătare de 165 Hz și timp de răspuns de 1 ms. Oferă o experiență de gaming captivantă, imagini fluide prin AMD FreeSync Premium și culori vibrante datorită tehnologiei HDR10.`,
    name_en: `Samsung Odyssey G5 C34G55TWWP Monitor`,
    description_en: `34-inch curved Samsung Odyssey G5 monitor with Ultra WQHD resolution, a 165 Hz refresh rate, and 1 ms response time. Delivers an immersive gaming experience, smooth motion via AMD FreeSync Premium, and vivid colors thanks to HDR10 technology.`,
    name_es: `Monitor Samsung Odyssey G5 C34G55TWWP`,
    description_es: `Monitor curvo Samsung Odyssey G5 de 34" con resolución Ultra WQHD, tasa de refresco de 165 Hz y tiempo de respuesta de 1 ms. Ofrece una experiencia de juego inmersiva, imágenes fluidas gracias a AMD FreeSync Premium y colores vibrantes gracias a la tecnología HDR10.`,
    name_de: `Samsung Odyssey G5 C34G55TWWP Monitor`,
    description_de: `34-Zoll-Curved-Monitor Samsung Odyssey G5 mit Ultra-WQHD-Auflösung, 165-Hz-Bildwiederholrate und 1 ms Reaktionszeit. Bietet ein packendes Gaming-Erlebnis, flüssige Bewegungen dank AMD FreeSync Premium und lebendige Farben dank HDR10-Technologie.`,
    specs: [['Diagonală', '34"'], ['Tip ecran', 'Curbat'], ['Rezoluție', 'Ultra WQHD'], ['Rată de reîmprospătare', '165 Hz'], ['Timp de răspuns', '1 ms'], ['Sincronizare', 'AMD FreeSync Premium'], ['HDR', 'HDR10']],
  },
  {
    id: 'monitor-5', cod: 'MK-MON-05', category: 'monitoare', img: 'monitor5', price: 1299,
    name: `Samsung ViewFinity S7 S37D700EAU Monitor`,
    description: `Monitor LED de 37” cu rezoluție 4K Ultra HD (3840×2160), ideal pentru productivitate și multimedia. Panoul VA oferă culori intense și contrast ridicat, iar difuzoarele integrate și conectivitatea HDMI/DisplayPort asigură o experiență completă de utilizare.`,
    name_en: `Samsung ViewFinity S7 S37D700EAU Monitor`,
    description_en: `37-inch LED monitor with 4K Ultra HD resolution (3840×2160), ideal for productivity and multimedia. The VA panel delivers rich colors and high contrast, while built-in speakers and HDMI/DisplayPort connectivity provide a complete user experience.`,
    name_es: `Monitor Samsung ViewFinity S7 S37D700EAU`,
    description_es: `Monitor LED de 37" con resolución 4K Ultra HD (3840×2160), ideal para la productividad y el multimedia. El panel VA ofrece colores intensos y un alto contraste, mientras que los altavoces integrados y la conectividad HDMI/DisplayPort garantizan una experiencia de uso completa.`,
    name_de: `Samsung ViewFinity S7 S37D700EAU Monitor`,
    description_de: `37-Zoll-LED-Monitor mit 4K-Ultra-HD-Auflösung (3840×2160), ideal für Produktivität und Multimedia. Das VA-Panel bietet kräftige Farben und hohen Kontrast, während integrierte Lautsprecher und HDMI/DisplayPort-Anschlüsse ein vollständiges Nutzererlebnis bieten.`,
    specs: [['Diagonală', '37"'], ['Tip panou', 'VA'], ['Rezoluție', '4K Ultra HD (3840×2160)'], ['Audio', 'Difuzoare integrate'], ['Conectivitate', 'HDMI, DisplayPort']],
  },
  {
    id: 'monitor-6', cod: 'MK-MON-06', category: 'monitoare', img: 'monitor6', price: 1690,
    name: `EIZO FlexScan EV2490-WT Full HD LED Alb`,
    description: `Monitor IPS Full HD cu conectivitate USB-C și alimentare de până la 70W, ideal pentru birou și productivitate. Oferă imagini clare, multi-monitor, tehnologii avansate de protecție a ochilor pentru confort pe termen lung.`,
    name_en: `EIZO FlexScan EV2490-WT Full HD LED White Monitor`,
    description_en: `Full HD IPS monitor with USB-C connectivity and up to 70W power delivery, ideal for office and productivity use. Offers clear images, multi-monitor support, and advanced eye-care technologies for long-term comfort.`,
    name_es: `Monitor LED Full HD EIZO FlexScan EV2490-WT Blanco`,
    description_es: `Monitor IPS Full HD con conectividad USB-C y suministro de energía de hasta 70 W, ideal para la oficina y la productividad. Ofrece imágenes nítidas, compatibilidad multi-monitor y tecnologías avanzadas de cuidado ocular para un confort duradero.`,
    name_de: `EIZO FlexScan EV2490-WT Full-HD-LED-Monitor Weiß`,
    description_de: `Full-HD-IPS-Monitor mit USB-C-Anschluss und einer Stromversorgung von bis zu 70 W, ideal für Büro und Produktivität. Bietet klare Bilder, Multi-Monitor-Unterstützung und fortschrittliche Augenschutztechnologien für langfristigen Komfort.`,
    specs: [['Tip panou', 'IPS'], ['Rezoluție', 'Full HD'], ['Conectivitate', 'USB-C'], ['Alimentare prin USB-C', 'Până la 70W'], ['Configurație', 'Multi-monitor'], ['Culoare', 'Alb']],
  },

  /* ---------- PERIFERICE ---------- */
  {
    id: 'periferic-1', cod: 'MK-PER-01', category: 'periferice', img: 'periferic1', price: 759,
    name: `Tastatură mecanică gaming BlackWidow V4`,
    description: `Tastatură mecanică Razer BlackWidow V4 Pro, echipată cu switch-uri Razer Green pentru răspuns rapid și precis. Dispune de iluminare RGB personalizabilă, design ergonomic și construcție durabilă, fiind ideală pentru gaming și utilizare intensivă.`,
    name_en: `BlackWidow V4 Mechanical Gaming Keyboard`,
    description_en: `Razer BlackWidow V4 Pro mechanical keyboard, equipped with Razer Green switches for fast, precise feedback. Features customizable RGB lighting, an ergonomic design, and durable construction, making it ideal for gaming and heavy use.`,
    name_es: `Teclado mecánico gaming BlackWidow V4`,
    description_es: `Teclado mecánico Razer BlackWidow V4 Pro, equipado con switches Razer Green para una respuesta rápida y precisa. Cuenta con iluminación RGB personalizable, diseño ergonómico y construcción duradera, siendo ideal para juegos y uso intensivo.`,
    name_de: `BlackWidow V4 Mechanische Gaming-Tastatur`,
    description_de: `Mechanische Tastatur Razer BlackWidow V4 Pro, ausgestattet mit Razer-Green-Switches für schnelles, präzises Feedback. Bietet anpassbare RGB-Beleuchtung, ergonomisches Design und robuste Verarbeitung — ideal für Gaming und intensive Nutzung.`,
    specs: [['Tip', 'Tastatură mecanică gaming'], ['Model', 'Razer BlackWidow V4 Pro'], ['Switch-uri', 'Razer Green'], ['Iluminare', 'RGB personalizabilă'], ['Design', 'Ergonomic']],
  },
  {
    id: 'periferic-2', cod: 'MK-PER-02', category: 'periferice', img: 'periferic2', price: 250,
    name: `Razer Basilisk V3 Pro (RZ01-04620100-R3G1) Mouse`,
    description: `Mouse gaming wireless Razer Basilisk V3 Pro, dotat cu senzor optic de până la 30.000 DPI pentru precizie excepțională. Dispune de 11 butoane programabile, iluminare Razer Chroma RGB și conectivitate wireless ultra-rapidă, oferind confort și performanță de top în orice sesiune de gaming.`,
    name_en: `Razer Basilisk V3 Pro (RZ01-04620100-R3G1) Mouse`,
    description_en: `Razer Basilisk V3 Pro wireless gaming mouse, equipped with an optical sensor of up to 30,000 DPI for exceptional precision. Features 11 programmable buttons, Razer Chroma RGB lighting, and ultra-fast wireless connectivity, delivering comfort and top-tier performance in any gaming session.`,
    name_es: `Ratón Razer Basilisk V3 Pro (RZ01-04620100-R3G1)`,
    description_es: `Ratón gaming inalámbrico Razer Basilisk V3 Pro, equipado con un sensor óptico de hasta 30.000 DPI para una precisión excepcional. Cuenta con 11 botones programables, iluminación Razer Chroma RGB y conectividad inalámbrica ultrarrápida, ofreciendo comodidad y un rendimiento de primer nivel en cualquier sesión de juego.`,
    name_de: `Razer Basilisk V3 Pro (RZ01-04620100-R3G1) Maus`,
    description_de: `Kabellose Gaming-Maus Razer Basilisk V3 Pro mit optischem Sensor mit bis zu 30.000 DPI für außergewöhnliche Präzision. Verfügt über 11 programmierbare Tasten, Razer-Chroma-RGB-Beleuchtung und ultraschnelle kabellose Verbindung für Komfort und Spitzenleistung in jeder Gaming-Session.`,
    specs: [['Tip', 'Mouse gaming wireless'], ['Senzor', 'Optic, până la 30.000 DPI'], ['Butoane', '11 programabile'], ['Iluminare', 'Razer Chroma RGB'], ['Conectivitate', 'Wireless']],
  },
  {
    id: 'periferic-3', cod: 'MK-PER-03', category: 'periferice', img: 'periferic3', price: 602,
    name: `Brother/HL-L2402DYJ1/Print/Laser/A4/USB HLL2402DYJ1`,
    description: `Imprimantă laser Brother monocromă, ideală pentru birou, cu viteză de imprimare de până la 28 pagini pe minut și rezoluție de 1200×1200 dpi. Dispune de imprimare față-verso automată, tavă de 250 de coli și consum redus de toner pentru eficiență sporită.`,
    name_en: `Brother HL-L2402DYJ1 Print/Laser/A4/USB Printer`,
    description_en: `Brother monochrome laser printer, ideal for the office, with a print speed of up to 28 pages per minute and 1200×1200 dpi resolution. Features automatic double-sided printing, a 250-sheet tray, and low toner consumption for improved efficiency.`,
    name_es: `Impresora Brother HL-L2402DYJ1 Print/Laser/A4/USB`,
    description_es: `Impresora láser monocromo Brother, ideal para la oficina, con una velocidad de impresión de hasta 28 páginas por minuto y una resolución de 1200×1200 ppp. Cuenta con impresión automática a doble cara, bandeja de 250 hojas y bajo consumo de tóner para una mayor eficiencia.`,
    name_de: `Brother HL-L2402DYJ1 Print/Laser/A4/USB Drucker`,
    description_de: `Brother Monochrom-Laserdrucker, ideal für das Büro, mit einer Druckgeschwindigkeit von bis zu 28 Seiten pro Minute und einer Auflösung von 1200×1200 dpi. Verfügt über automatischen Duplexdruck, ein Fach für 250 Blatt und geringen Tonerverbrauch für höhere Effizienz.`,
    specs: [['Tip', 'Imprimantă laser monocromă'], ['Format', 'A4'], ['Viteză de imprimare', 'Până la 28 pagini/minut'], ['Rezoluție', '1200×1200 dpi'], ['Față-verso', 'Automată'], ['Tavă hârtie', '250 de coli'], ['Conectivitate', 'USB']],
  },
  {
    id: 'periferic-4', cod: 'MK-PER-04', category: 'periferice', img: 'periferic4', price: 1377,
    name: `Scanner documente IRIScan Desk 6`,
    description: `Scanner portabil IRIScan Desk 6 cu cameră de 8 MP și funcție OCR, ideal pentru digitalizarea rapidă a documentelor A4. Scanează în mai puțin de o secundă, oferă conversie în PDF, Word și Excel și include iluminare LED integrată pentru imagini clare și precise.`,
    name_en: `IRIScan Desk 6 Document Scanner`,
    description_en: `IRIScan Desk 6 portable scanner with an 8 MP camera and OCR function, ideal for quickly digitizing A4 documents. Scans in under a second, converts to PDF, Word, and Excel, and includes built-in LED lighting for clear, accurate images.`,
    name_es: `Escáner de documentos IRIScan Desk 6`,
    description_es: `Escáner portátil IRIScan Desk 6 con cámara de 8 MP y función OCR, ideal para digitalizar documentos A4 rápidamente. Escanea en menos de un segundo, permite convertir a PDF, Word y Excel, e incluye iluminación LED integrada para imágenes claras y precisas.`,
    name_de: `IRIScan Desk 6 Dokumentenscanner`,
    description_de: `Tragbarer Scanner IRIScan Desk 6 mit 8-MP-Kamera und OCR-Funktion, ideal für die schnelle Digitalisierung von A4-Dokumenten. Scannt in weniger als einer Sekunde, ermöglicht die Umwandlung in PDF, Word und Excel und verfügt über eine integrierte LED-Beleuchtung für klare, präzise Bilder.`,
    specs: [['Tip', 'Scanner portabil'], ['Cameră', '8 MP'], ['Format documente', 'A4'], ['Funcție OCR', 'Da'], ['Timp de scanare', 'Sub o secundă'], ['Export', 'PDF, Word, Excel'], ['Iluminare', 'LED integrată']],
  },
  {
    id: 'periferic-5', cod: 'MK-PER-05', category: 'periferice', img: 'periferic5', price: 359, oldPrice: 429,
    name: `Logitech Brio 500 cameră web 4 MP 1920x1080 Pixel USB-C Grafit`,
    description: `Cameră web Logitech Brio 500 cu rezoluție Full HD 1080p, ideală pentru videoconferințe, streaming și cursuri online. Dispune de corecție automată a luminii, microfoane cu reducerea zgomotului și capac de confidențialitate integrat, oferind imagine și sunet de înaltă calitate.`,
    name_en: `Logitech Brio 500 Webcam, 4 MP, 1920x1080, USB-C, Graphite`,
    description_en: `Logitech Brio 500 webcam with Full HD 1080p resolution, ideal for video calls, streaming, and online classes. Features automatic light correction, noise-reducing microphones, and a built-in privacy shutter, delivering high-quality image and sound.`,
    name_es: `Cámara web Logitech Brio 500, 4 MP, 1920x1080, USB-C, Grafito`,
    description_es: `Cámara web Logitech Brio 500 con resolución Full HD 1080p, ideal para videoconferencias, streaming y clases en línea. Cuenta con corrección automática de luz, micrófonos con reducción de ruido y una tapa de privacidad integrada, ofreciendo imagen y sonido de alta calidad.`,
    name_de: `Logitech Brio 500 Webcam, 4 MP, 1920x1080, USB-C, Graphit`,
    description_de: `Webcam Logitech Brio 500 mit Full-HD-1080p-Auflösung, ideal für Videokonferenzen, Streaming und Online-Kurse. Verfügt über automatische Lichtkorrektur, geräuschreduzierende Mikrofone und eine integrierte Objektivabdeckung für hochwertige Bild- und Tonqualität.`,
    specs: [['Rezoluție video', 'Full HD 1080p (1920×1080)'], ['Senzor', '4 MP'], ['Conectare', 'USB-C'], ['Lumină', 'Corecție automată'], ['Microfoane', 'Cu reducerea zgomotului'], ['Confidențialitate', 'Capac integrat'], ['Culoare', 'Grafit']],
  },
  {
    id: 'periferic-6', cod: 'MK-PER-06', category: 'periferice', img: 'periferic6', price: 879,
    name: `Polk Monitor XT15 (x2) Boxe audio`,
    description: `Boxe de raft Polk Monitor XT15, concepute pentru un sunet clar și echilibrat. Echipate cu tweeter de 1” și woofer de 5,25”, oferă redare detaliată a muzicii și filmelor, cu răspuns în frecvență extins și compatibilitate cu amplificatoare de 30–150 W.`,
    name_en: `Polk Monitor XT15 (x2) Bookshelf Speakers`,
    description_en: `Polk Monitor XT15 bookshelf speakers, designed for clear, balanced sound. Equipped with a 1-inch tweeter and a 5.25-inch woofer, they deliver detailed playback of music and movies, with an extended frequency response and compatibility with 30–150 W amplifiers.`,
    name_es: `Altavoces de estantería Polk Monitor XT15 (x2)`,
    description_es: `Altavoces de estantería Polk Monitor XT15, diseñados para un sonido claro y equilibrado. Equipados con un tweeter de 1" y un woofer de 5,25", ofrecen una reproducción detallada de música y películas, con una respuesta de frecuencia extendida y compatibilidad con amplificadores de 30-150 W.`,
    name_de: `Polk Monitor XT15 (2 Stk.) Regallautsprecher`,
    description_de: `Regallautsprecher Polk Monitor XT15, für einen klaren, ausgewogenen Klang konzipiert. Ausgestattet mit einem 1-Zoll-Hochtöner und einem 5,25-Zoll-Tieftöner bieten sie eine detaillierte Wiedergabe von Musik und Filmen, mit erweitertem Frequenzgang und Kompatibilität mit Verstärkern von 30-150 W.`,
    specs: [['Tip', 'Boxe de raft'], ['Pachet', '2 boxe (x2)'], ['Tweeter', '1"'], ['Woofer', '5,25"'], ['Amplificatoare compatibile', '30–150 W']],
  },

  /* ---------- UNITĂȚI ---------- */
  {
    id: 'unitate-1', cod: 'MK-UNI-01', category: 'unitati', img: 'unitate1', price: 4599,
    name: `HP ProDesk 2 SFF G1i, Core i5-14400 2.5GHz, 512GB SSD, 8GB RAM`,
    description: `Unitate centrală HP cu procesor Intel Core i5, SSD de 512 GB și sistem de operare Windows 11 Pro, concepută pentru productivitate și utilizare profesională. Oferă pornire rapidă, conectivitate modernă prin HDMI, DisplayPort și USB-C, fiind ideală pentru birou și activități de zi cu zi.`,
    name_en: `HP ProDesk 2 SFF G1i, Core i5-14400 2.5GHz, 512GB SSD, 8GB RAM`,
    description_en: `HP desktop PC with an Intel Core i5 processor, a 512 GB SSD, and Windows 11 Pro, built for productivity and professional use. Offers fast boot times and modern connectivity via HDMI, DisplayPort, and USB-C, making it ideal for the office and everyday tasks.`,
    name_es: `HP ProDesk 2 SFF G1i, Core i5-14400 2.5GHz, SSD 512GB, 8GB RAM`,
    description_es: `Ordenador de sobremesa HP con procesador Intel Core i5, SSD de 512 GB y sistema operativo Windows 11 Pro, diseñado para la productividad y el uso profesional. Ofrece un arranque rápido y conectividad moderna mediante HDMI, DisplayPort y USB-C, siendo ideal para la oficina y las actividades diarias.`,
    name_de: `HP ProDesk 2 SFF G1i, Core i5-14400 2,5GHz, 512GB SSD, 8GB RAM`,
    description_de: `HP-Desktop-PC mit Intel-Core-i5-Prozessor, 512-GB-SSD und Windows 11 Pro, konzipiert für Produktivität und den professionellen Einsatz. Bietet schnelle Startzeiten und moderne Konnektivität über HDMI, DisplayPort und USB-C — ideal für Büro und Alltag.`,
    specs: [['Procesor', 'Intel Core i5-14400 (2.5GHz)'], ['Memorie RAM', '8GB'], ['Stocare', '512GB SSD'], ['Sistem de operare', 'Windows 11 Pro'], ['Format carcasă', 'SFF'], ['Porturi', 'HDMI, DisplayPort, USB-C']],
  },
  {
    id: 'unitate-2', cod: 'MK-UNI-02', category: 'unitati', img: 'unitate2', price: 3445, oldPrice: 3999,
    name: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400, 16GB, 512GB SSD, Intel UHD 730`,
    description: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400 (4.7GHz), 16GB RAM, 512GB SSD, Intel UHD 730, Windows 11 Pro.`,
    name_en: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400, 16GB, 512GB SSD, Intel UHD 730`,
    description_en: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400 (4.7GHz), 16GB RAM, 512GB SSD, Intel UHD 730, Windows 11 Pro.`,
    name_es: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400, 16GB, 512GB SSD, Intel UHD 730`,
    description_es: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400 (4.7GHz), 16GB RAM, 512GB SSD, Intel UHD 730, Windows 11 Pro.`,
    name_de: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400, 16GB, 512GB SSD, Intel UHD 730`,
    description_de: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400 (4.7GHz), 16GB RAM, 512GB SSD, Intel UHD 730, Windows 11 Pro.`,
    specs: [['Procesor', 'Intel Core i5-14400 (4.7GHz)'], ['Memorie RAM', '16GB'], ['Stocare', '512GB SSD'], ['Placă video', 'Intel UHD 730'], ['Sistem de operare', 'Windows 11 Pro']],
  },
  {
    id: 'unitate-3', cod: 'MK-UNI-03', category: 'unitati', img: 'unitate3', price: 3681,
    name: `CHS PC Barracuda, Core i5-12400 2.5GHz, 16GB, 512GB SSD, mouse+tastatură, Windows 11 Pro`,
    description: `Sistem desktop echipat cu procesor Intel Core i5-12400, 16 GB RAM și SSD de 512 GB, oferind performanță rapidă pentru activități de birou, studiu și multitasking. Include Windows 11 Pro, tastatură și mouse, fiind o soluție completă și gata de utilizare.`,
    name_en: `CHS PC Barracuda, Core i5-12400 2.5GHz, 16GB, 512GB SSD, Mouse+Keyboard, Windows 11 Pro`,
    description_en: `Desktop system equipped with an Intel Core i5-12400 processor, 16 GB RAM, and a 512 GB SSD, delivering fast performance for office work, studying, and multitasking. Includes Windows 11 Pro, a keyboard, and a mouse, making it a complete, ready-to-use solution.`,
    name_es: `CHS PC Barracuda, Core i5-12400 2.5GHz, 16GB, SSD 512GB, ratón+teclado, Windows 11 Pro`,
    description_es: `Sistema de sobremesa equipado con procesador Intel Core i5-12400, 16 GB de RAM y SSD de 512 GB, que ofrece un rendimiento rápido para tareas de oficina, estudio y multitarea. Incluye Windows 11 Pro, teclado y ratón, siendo una solución completa y lista para usar.`,
    name_de: `CHS PC Barracuda, Core i5-12400 2,5GHz, 16GB, 512GB SSD, Maus+Tastatur, Windows 11 Pro`,
    description_de: `Desktop-System mit Intel-Core-i5-12400-Prozessor, 16 GB RAM und 512-GB-SSD, das eine schnelle Leistung für Büroarbeit, Studium und Multitasking bietet. Enthält Windows 11 Pro, Tastatur und Maus — eine komplette, sofort einsatzbereite Lösung.`,
    specs: [['Procesor', 'Intel Core i5-12400 (2.5GHz)'], ['Memorie RAM', '16GB'], ['Stocare', '512GB SSD'], ['Sistem de operare', 'Windows 11 Pro'], ['Accesorii incluse', 'Tastatură și mouse']],
  },
  {
    id: 'unitate-4', cod: 'MK-UNI-04', category: 'unitati', img: 'unitate4', price: 6677,
    name: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, W11H`,
    description: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, Windows 11 Home.`,
    name_en: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, W11H`,
    description_en: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, Windows 11 Home.`,
    name_es: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, W11H`,
    description_es: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, Windows 11 Home.`,
    name_de: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, W11H`,
    description_de: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, Windows 11 Home.`,
    specs: [['Procesor', 'Intel i5 14400F'], ['Placă video', 'RTX 5070 12GB'], ['Memorie RAM', '32GB'], ['Stocare', '1TB SSD'], ['Wireless', 'WiFi'], ['Sistem de operare', 'Windows 11 Home']],
  },
  {
    id: 'unitate-5', cod: 'MK-UNI-05', category: 'unitati', img: 'unitate5', price: 10159,
    name: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD`,
    description: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD, Windows 11 Home.`,
    name_en: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD`,
    description_en: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD, Windows 11 Home.`,
    name_es: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD`,
    description_es: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD, Windows 11 Home.`,
    name_de: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD`,
    description_de: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD, Windows 11 Home.`,
    specs: [['Procesor', 'AMD Ryzen 7 9800X3D'], ['Placă video', 'RTX 5080 16GB'], ['Memorie RAM', '32GB'], ['Stocare', '2TB SSD'], ['Sistem de operare', 'Windows 11 Home']],
  },
  {
    id: 'unitate-6', cod: 'MK-UNI-06', category: 'unitati', img: 'unitate6', price: 3199,
    name: `Lenovo ThinkCentre Neo 50t 12UD0033RI`,
    description: `Lenovo ThinkCentre Neo 50t 12UD0033RI este un desktop pentru birou și acasă, echipat cu procesor Intel Core i5 la 2500 MHz (socket LGA1700) și 8 GB memorie RAM, oferind performanță stabilă pentru activități zilnice.`,
    name_en: `Lenovo ThinkCentre Neo 50t 12UD0033RI`,
    description_en: `The Lenovo ThinkCentre Neo 50t 12UD0033RI is a desktop for home and office use, equipped with an Intel Core i5 processor at 2500 MHz (LGA1700 socket) and 8 GB of RAM, delivering stable performance for everyday tasks.`,
    name_es: `Lenovo ThinkCentre Neo 50t 12UD0033RI`,
    description_es: `El Lenovo ThinkCentre Neo 50t 12UD0033RI es un ordenador de sobremesa para el hogar y la oficina, equipado con un procesador Intel Core i5 a 2500 MHz (socket LGA1700) y 8 GB de memoria RAM, que ofrece un rendimiento estable para las tareas diarias.`,
    name_de: `Lenovo ThinkCentre Neo 50t 12UD0033RI`,
    description_de: `Der Lenovo ThinkCentre Neo 50t 12UD0033RI ist ein Desktop-PC für Zuhause und Büro, ausgestattet mit einem Intel-Core-i5-Prozessor mit 2500 MHz (Sockel LGA1700) und 8 GB Arbeitsspeicher, der eine stabile Leistung für den Alltag bietet.`,
    specs: [['Model', 'ThinkCentre Neo 50t (12UD0033RI)'], ['Procesor', 'Intel Core i5 (2500 MHz)'], ['Socket', 'LGA1700'], ['Memorie RAM', '8 GB']],
  },

  /* ---------- LAPTOPURI ---------- */
  {
    id: 'laptop-1', cod: 'MK-LAP-01', category: 'laptopuri', img: 'laptop1', price: 2599,
    name: `MacBook Air 13'' 2020, M1 8 Cores, 8GB, 7-core GPU, 256GB`,
    description: `MacBook Air 13” (2020) este un laptop ușor și portabil, cu procesor Apple M1, 8 GB RAM, SSD de 256 GB și ecran Retina de 13,3”, oferind performanță bună pentru muncă și divertisment.`,
    name_en: `MacBook Air 13'' 2020, M1 8 Cores, 8GB, 7-core GPU, 256GB`,
    description_en: `The MacBook Air 13” (2020) is a light, portable laptop with an Apple M1 processor, 8 GB RAM, a 256 GB SSD, and a 13.3” Retina display, delivering solid performance for work and entertainment.`,
    name_es: `MacBook Air 13'' 2020, M1 8 núcleos, 8GB, GPU 7 núcleos, 256GB`,
    description_es: `El MacBook Air de 13" (2020) es un portátil ligero y portable con procesador Apple M1, 8 GB de RAM, SSD de 256 GB y pantalla Retina de 13,3", que ofrece un buen rendimiento para el trabajo y el entretenimiento.`,
    name_de: `MacBook Air 13'' 2020, M1 8-Core, 8GB, 7-Core-GPU, 256GB`,
    description_de: `Das MacBook Air 13” (2020) ist ein leichtes, tragbares Notebook mit Apple-M1-Prozessor, 8 GB RAM, 256-GB-SSD und einem 13,3-Zoll-Retina-Display, das eine solide Leistung für Arbeit und Unterhaltung bietet.`,
    specs: [['Procesor', 'Apple M1 (8 nuclee)'], ['Placă video', 'GPU cu 7 nuclee'], ['Memorie RAM', '8 GB'], ['Stocare', '256 GB SSD'], ['Ecran', 'Retina 13,3"'], ['An', '2020']],
  },
  {
    id: 'laptop-2', cod: 'MK-LAP-02', category: 'laptopuri', img: 'laptop2', price: 6779,
    name: `Laptop ASUS ROG Strix Scar 18 inch 2.5K Intel Core Ultra`,
    description: `Laptop ASUS ROG Strix Scar 18 inch 2.5K, Intel Core Ultra 9 275HX, 64GB RAM, 2TB SSD, RTX 5080, Free DOS, Off Black.`,
    name_en: `Laptop ASUS ROG Strix Scar 18 inch 2.5K Intel Core Ultra`,
    description_en: `Laptop ASUS ROG Strix Scar 18 inch 2.5K, Intel Core Ultra 9 275HX, 64GB RAM, 2TB SSD, RTX 5080, Free DOS, Off Black.`,
    name_es: `Laptop ASUS ROG Strix Scar 18 inch 2.5K Intel Core Ultra`,
    description_es: `Laptop ASUS ROG Strix Scar 18 inch 2.5K, Intel Core Ultra 9 275HX, 64GB RAM, 2TB SSD, RTX 5080, Free DOS, Off Black.`,
    name_de: `Laptop ASUS ROG Strix Scar 18 inch 2.5K Intel Core Ultra`,
    description_de: `Laptop ASUS ROG Strix Scar 18 inch 2.5K, Intel Core Ultra 9 275HX, 64GB RAM, 2TB SSD, RTX 5080, Free DOS, Off Black.`,
    specs: [['Ecran', '18" 2.5K'], ['Procesor', 'Intel Core Ultra 9 275HX'], ['Memorie RAM', '64GB'], ['Stocare', '2TB SSD'], ['Placă video', 'RTX 5080'], ['Sistem de operare', 'Free DOS'], ['Culoare', 'Off Black']],
  },
  {
    id: 'laptop-3', cod: 'MK-LAP-03', category: 'laptopuri', img: 'laptop3', price: 3459, oldPrice: 3899,
    name: `Laptop Lenovo ThinkPad T14 Gen 5 cu procesor Intel`,
    description: `Lenovo ThinkPad T14 Gen 5 este un laptop profesional de 14”, echipat cu procesor Intel Core Ultra 7 155U, 64 GB RAM DDR5 și SSD de 1 TB. Oferă performanță ridicată, funcții AI integrate, ecran WUXGA IPS de calitate, securitate avansată și durabilitate certificată MIL-STD-810H.`,
    name_en: `Lenovo ThinkPad T14 Gen 5 Intel Laptop`,
    description_en: `The Lenovo ThinkPad T14 Gen 5 is a professional 14” laptop equipped with an Intel Core Ultra 7 155U processor, 64 GB DDR5 RAM, and a 1 TB SSD. It offers high performance, built-in AI features, a quality WUXGA IPS display, advanced security, and MIL-STD-810H certified durability.`,
    name_es: `Portátil Lenovo ThinkPad T14 Gen 5 con procesador Intel`,
    description_es: `El Lenovo ThinkPad T14 Gen 5 es un portátil profesional de 14" equipado con un procesador Intel Core Ultra 7 155U, 64 GB de RAM DDR5 y un SSD de 1 TB. Ofrece un alto rendimiento, funciones de IA integradas, una pantalla WUXGA IPS de calidad, seguridad avanzada y una durabilidad certificada según MIL-STD-810H.`,
    name_de: `Lenovo ThinkPad T14 Gen 5 Laptop mit Intel-Prozessor`,
    description_de: `Das Lenovo ThinkPad T14 Gen 5 ist ein professionelles 14-Zoll-Notebook mit Intel-Core-Ultra-7-155U-Prozessor, 64 GB DDR5-RAM und 1-TB-SSD. Es bietet hohe Leistung, integrierte KI-Funktionen, ein hochwertiges WUXGA-IPS-Display, erweiterte Sicherheit und nach MIL-STD-810H zertifizierte Robustheit.`,
    specs: [['Ecran', '14" WUXGA IPS'], ['Procesor', 'Intel Core Ultra 7 155U'], ['Memorie RAM', '64 GB DDR5'], ['Stocare', '1 TB SSD'], ['Funcții AI', 'Integrate'], ['Durabilitate', 'Certificare MIL-STD-810H']],
  },
  {
    id: 'laptop-4', cod: 'MK-LAP-04', category: 'laptopuri', img: 'laptop4', price: 3851,
    name: `Laptop Acer Aspire Go 15 - AG15-42P-R1ME argintiu`,
    description: `Laptopul de 15,6” este echipat cu procesor AMD Ryzen 5/7, placă video integrată AMD Radeon, până la 16 GB RAM și SSD de până la 1 TB. Oferă ecran Full HD mat, conectivitate modernă și performanță potrivită pentru activități de zi cu zi și productivitate.`,
    name_en: `Acer Aspire Go 15 - AG15-42P-R1ME Silver Laptop`,
    description_en: `This 15.6” laptop is equipped with an AMD Ryzen 5/7 processor, integrated AMD Radeon graphics, up to 16 GB RAM, and up to 1 TB SSD. It offers a matte Full HD display, modern connectivity, and performance suited for everyday tasks and productivity.`,
    name_es: `Portátil Acer Aspire Go 15 - AG15-42P-R1ME plateado`,
    description_es: `Este portátil de 15,6" está equipado con procesador AMD Ryzen 5/7, gráficos integrados AMD Radeon, hasta 16 GB de RAM y hasta 1 TB de SSD. Ofrece una pantalla Full HD mate, conectividad moderna y un rendimiento adecuado para las tareas diarias y la productividad.`,
    name_de: `Acer Aspire Go 15 - AG15-42P-R1ME Silber Laptop`,
    description_de: `Dieses 15,6-Zoll-Notebook ist mit einem AMD-Ryzen-5/7-Prozessor, integrierter AMD-Radeon-Grafik, bis zu 16 GB RAM und bis zu 1 TB SSD ausgestattet. Es bietet ein mattes Full-HD-Display, moderne Konnektivität und eine für Alltag und Produktivität geeignete Leistung.`,
    specs: [['Ecran', '15,6" Full HD mat'], ['Procesor', 'AMD Ryzen 5/7'], ['Placă video', 'AMD Radeon (integrată)'], ['Memorie RAM', 'Până la 16 GB'], ['Stocare', 'SSD de până la 1 TB'], ['Culoare', 'Argintiu']],
  },
  {
    id: 'laptop-5', cod: 'MK-LAP-05', category: 'laptopuri', img: 'laptop5', price: 7585,
    name: `Apple MacBook Air 15 M4 Z1HF000EV Laptop`,
    description: `Apple MacBook Air 15.3” este un laptop performant și ușor, echipat cu procesor Apple M4, 32 GB RAM DDR5 și SSD de 512 GB. Dispune de ecran IPS de înaltă rezoluție, cameră Full HD, tastatură iluminată și sistem de operare macOS, fiind ideal pentru productivitate și utilizare zilnică.`,
    name_en: `Apple MacBook Air 15 M4 Z1HF000EV Laptop`,
    description_en: `The Apple MacBook Air 15.3” is a powerful, lightweight laptop equipped with an Apple M4 processor, 32 GB DDR5 RAM, and a 512 GB SSD. It features a high-resolution IPS display, a Full HD camera, a backlit keyboard, and macOS, making it ideal for productivity and daily use.`,
    name_es: `Apple MacBook Air 15 M4 Z1HF000EV`,
    description_es: `El Apple MacBook Air de 15,3" es un portátil potente y ligero equipado con procesador Apple M4, 32 GB de RAM DDR5 y SSD de 512 GB. Cuenta con una pantalla IPS de alta resolución, cámara Full HD, teclado retroiluminado y sistema operativo macOS, siendo ideal para la productividad y el uso diario.`,
    name_de: `Apple MacBook Air 15 M4 Z1HF000EV Laptop`,
    description_de: `Das Apple MacBook Air 15,3” ist ein leistungsstarkes, leichtes Notebook mit Apple-M4-Prozessor, 32 GB DDR5-RAM und 512-GB-SSD. Es verfügt über ein hochauflösendes IPS-Display, eine Full-HD-Kamera, eine beleuchtete Tastatur und macOS — ideal für Produktivität und den täglichen Einsatz.`,
    specs: [['Ecran', '15,3" IPS, înaltă rezoluție'], ['Procesor', 'Apple M4'], ['Memorie RAM', '32 GB DDR5'], ['Stocare', '512 GB SSD'], ['Cameră', 'Full HD'], ['Tastatură', 'Iluminată'], ['Sistem de operare', 'macOS']],
  },
  {
    id: 'laptop-6', cod: 'MK-LAP-06', category: 'laptopuri', img: 'laptop6', price: 4559,
    name: `Laptop 25-26 de 15,6 inci pentru Windows 11, procesor cu 4 nuclee`,
    description: `Laptopul de 15,6” este echipat cu procesor Intel Celeron N5095, 32 GB RAM LPDDR4 și SSD, oferind performanță potrivită pentru activități de birou și studiu. Dispune de ecran Full HD IPS, cititor de amprentă și conectivitate Wi-Fi și Bluetooth.`,
    name_en: `15.6-inch Laptop for Windows 11, Quad-Core Processor`,
    description_en: `This 15.6” laptop is equipped with an Intel Celeron N5095 processor, 32 GB LPDDR4 RAM, and an SSD, offering performance suited for office work and studying. It features a Full HD IPS display, a fingerprint reader, and Wi-Fi and Bluetooth connectivity.`,
    name_es: `Portátil de 15,6 pulgadas para Windows 11, procesador de 4 núcleos`,
    description_es: `Este portátil de 15,6" está equipado con procesador Intel Celeron N5095, 32 GB de RAM LPDDR4 y SSD, ofreciendo un rendimiento adecuado para tareas de oficina y estudio. Cuenta con pantalla Full HD IPS, lector de huellas dactilares y conectividad Wi-Fi y Bluetooth.`,
    name_de: `15,6-Zoll-Notebook für Windows 11, Quad-Core-Prozessor`,
    description_de: `Dieses 15,6-Zoll-Notebook ist mit einem Intel-Celeron-N5095-Prozessor, 32 GB LPDDR4-RAM und einer SSD ausgestattet und bietet eine für Büroarbeit und Studium geeignete Leistung. Es verfügt über ein Full-HD-IPS-Display, einen Fingerabdrucksensor sowie Wi-Fi- und Bluetooth-Konnektivität.`,
    specs: [['Ecran', '15,6" Full HD IPS'], ['Procesor', 'Intel Celeron N5095 (4 nuclee)'], ['Memorie RAM', '32 GB LPDDR4'], ['Stocare', 'SSD'], ['Securitate', 'Cititor de amprentă'], ['Conectivitate', 'Wi-Fi, Bluetooth'], ['Sistem de operare', 'Windows 11']],
  },

  /* ---------- CONSUMABILE ȘI RECHIZITE ---------- */
  {
    id: 'consumabil-1', cod: 'MK-CON-01', category: 'consumabile', img: 'consumabil1', price: 25,
    name: `Hârtie copiator A4 Niveus Fit 80 g/mp, 500 coli/top`,
    description: `Hârtia copiator Niveus Fit+ A4 este o hârtie de clasă B+, cu gramaj de 80 g/mp și grad ridicat de alb, potrivită pentru imprimare și copiere zilnică. Este recomandată pentru imprimante inkjet și laser, copiatoare și faxuri, oferind imprimări clare, atât alb-negru, cât și color.`,
    name_en: `Niveus Fit A4 Copier Paper, 80 g/m², 500 sheets/ream`,
    description_en: `Niveus Fit+ A4 copier paper is a class B+ paper with an 80 g/m² weight and a high whiteness level, suited for everyday printing and copying. Recommended for inkjet and laser printers, copiers, and fax machines, delivering crisp prints in both black-and-white and color.`,
    name_es: `Papel para copiadora A4 Niveus Fit 80 g/m², 500 hojas/paquete`,
    description_es: `El papel para copiadora Niveus Fit+ A4 es un papel de clase B+ con un gramaje de 80 g/m² y un alto grado de blancura, adecuado para la impresión y copia diaria. Se recomienda para impresoras de inyección de tinta y láser, copiadoras y faxes, ofreciendo impresiones nítidas tanto en blanco y negro como en color.`,
    name_de: `Niveus Fit A4 Kopierpapier, 80 g/m², 500 Blatt/Paket`,
    description_de: `Das Kopierpapier Niveus Fit+ A4 ist ein Papier der Klasse B+ mit einem Gewicht von 80 g/m² und einem hohen Weißgrad, geeignet für den täglichen Druck- und Kopierbedarf. Es wird für Tintenstrahl- und Laserdrucker, Kopierer und Faxgeräte empfohlen und liefert klare Drucke sowohl in Schwarz-Weiß als auch in Farbe.`,
    specs: [['Format', 'A4'], ['Gramaj', '80 g/mp'], ['Cantitate', '500 coli/top'], ['Clasă', 'B+'], ['Compatibilitate', 'Imprimante inkjet și laser, copiatoare, faxuri']],
  },
  {
    id: 'consumabil-2', cod: 'MK-CON-02', category: 'consumabile', img: 'consumabil2', price: 115,
    name: `Set de pixuri BIC Cristal - 1.0 mm, albastru, 50 buc`,
    description: `Pixul BIC Cristal albastru este un instrument de scris realizat din plastic, potrivit pentru școală și birou. Recomandat pentru copii de peste 6 ani și pentru elevii din clasele V–XII, acesta oferă o scriere clară și confortabilă în utilizarea zilnică.`,
    name_en: `BIC Cristal Pen Set - 1.0mm, Blue, 50 pcs`,
    description_en: `The BIC Cristal blue pen is a plastic writing instrument suited for school and office use. Recommended for children over 6 and for students in grades 5-12, it offers clear, comfortable writing for everyday use.`,
    name_es: `Set de bolígrafos BIC Cristal de 1,0 mm, azul, 50 unidades`,
    description_es: `El bolígrafo BIC Cristal azul es un instrumento de escritura de plástico adecuado para la escuela y la oficina. Recomendado para niños mayores de 6 años y para estudiantes de los cursos V-XII, ofrece una escritura clara y cómoda para el uso diario.`,
    name_de: `BIC Cristal Kugelschreiber-Set, 1,0 mm, Blau, 50 Stück`,
    description_de: `Der blaue BIC-Cristal-Kugelschreiber ist ein Schreibgerät aus Kunststoff, geeignet für Schule und Büro. Empfohlen für Kinder ab 6 Jahren und für Schüler der Klassen 5-12, bietet er ein klares, komfortables Schreiberlebnis im Alltag.`,
    specs: [['Grosime vârf', '1.0 mm'], ['Culoare', 'Albastru'], ['Cantitate', '50 buc'], ['Material', 'Plastic'], ['Vârstă recomandată', 'Peste 6 ani']],
  },
  {
    id: 'consumabil-3', cod: 'MK-CON-03', category: 'consumabile', img: 'consumabil3', price: 18,
    name: `Creioane grafit KOH-I-NOOR 2B / 5,6 mm, 6 buc`,
    description: `Creioanele grafit KOH-I-NOOR 2B, 5,6 mm sunt ideale pentru scriere, desen și schițe. Setul conține 6 creioane cu mină moale de tip 2B, care oferă linii clare și uniforme, fiind potrivite atât pentru uz școlar, cât și pentru activități artistice.`,
    name_en: `KOH-I-NOOR 2B Graphite Pencils, 5.6mm, 6 pcs`,
    description_en: `KOH-I-NOOR 2B graphite pencils, 5.6 mm, are ideal for writing, drawing, and sketching. The set contains 6 pencils with a soft 2B lead that produce clear, even lines, suitable for both school use and artistic activities.`,
    name_es: `Lápices de grafito KOH-I-NOOR 2B, 5,6 mm, 6 unidades`,
    description_es: `Los lápices de grafito KOH-I-NOOR 2B de 5,6 mm son ideales para escribir, dibujar y esbozar. El set contiene 6 lápices con mina blanda tipo 2B, que ofrecen líneas claras y uniformes, adecuados tanto para uso escolar como para actividades artísticas.`,
    name_de: `KOH-I-NOOR 2B Grafitstifte, 5,6 mm, 6 Stück`,
    description_de: `Die KOH-I-NOOR 2B Grafitstifte mit 5,6 mm eignen sich ideal zum Schreiben, Zeichnen und Skizzieren. Das Set enthält 6 Stifte mit weicher 2B-Mine, die klare, gleichmäßige Linien erzeugen und sich sowohl für den schulischen Gebrauch als auch für künstlerische Tätigkeiten eignen.`,
    specs: [['Duritate', '2B (mină moale)'], ['Diametru', '5,6 mm'], ['Cantitate', '6 buc'], ['Utilizare', 'Scriere, desen, schițe']],
  },
  {
    id: 'consumabil-4', cod: 'MK-CON-04', category: 'consumabile', img: 'consumabil4', price: 35,
    name: `Set caiete OXFORD Multicolor`,
    description: `Setul de caiete OXFORD Multicolor este potrivit pentru școală, facultate sau birou. Caietele au hârtie de calitate și coperți în culori variate, fiind ideale pentru organizarea notițelor și a activităților zilnice.`,
    name_en: `OXFORD Multicolor Notebook Set`,
    description_en: `The OXFORD Multicolor notebook set is suited for school, university, or office use. The notebooks feature quality paper and covers in a variety of colors, making them ideal for organizing notes and daily tasks.`,
    name_es: `Set de cuadernos OXFORD Multicolor`,
    description_es: `El set de cuadernos OXFORD Multicolor es adecuado para la escuela, la universidad o la oficina. Los cuadernos cuentan con papel de calidad y tapas en varios colores, siendo ideales para organizar apuntes y tareas diarias.`,
    name_de: `OXFORD Multicolor Heft-Set`,
    description_de: `Das OXFORD-Multicolor-Heft-Set eignet sich für Schule, Studium oder Büro. Die Hefte verfügen über hochwertiges Papier und Einbände in verschiedenen Farben und eignen sich ideal zur Organisation von Notizen und täglichen Aufgaben.`,
    specs: [['Brand', 'OXFORD'], ['Tip', 'Set caiete'], ['Coperți', 'Culori variate'], ['Utilizare', 'Școală, facultate, birou']],
  },
  {
    id: 'consumabil-5', cod: 'MK-CON-05', category: 'consumabile', img: 'consumabil5', price: 25,
    name: `Dosare din plastic A4 cu capsă DONAU`,
    description: `Mapele din plastic A4 cu capsă DONAU sunt ideale pentru păstrarea și organizarea documentelor. Realizate din material PP rezistent, cu grosime de 180 μm, acestea protejează eficient actele și permit închiderea sigură cu ajutorul capsei. Setul conține 5 mape, potrivite pentru școală, birou sau arhivare.`,
    name_en: `DONAU A4 Plastic Snap Folders`,
    description_en: `DONAU A4 plastic snap folders are ideal for storing and organizing documents. Made from durable PP material, 180 μm thick, they effectively protect papers and offer secure closure via a snap fastener. The set contains 5 folders, suitable for school, office, or archiving.`,
    name_es: `Carpetas de plástico A4 con broche DONAU`,
    description_es: `Las carpetas de plástico A4 con broche DONAU son ideales para guardar y organizar documentos. Fabricadas en material PP resistente, con un grosor de 180 μm, protegen eficazmente los papeles y permiten un cierre seguro mediante el broche. El set contiene 5 carpetas, adecuadas para la escuela, la oficina o el archivo.`,
    name_de: `DONAU A4 Kunststoffmappen mit Druckknopf`,
    description_de: `Die DONAU A4-Kunststoffmappen mit Druckknopf eignen sich ideal zum Aufbewahren und Organisieren von Dokumenten. Aus widerstandsfähigem PP-Material mit 180 μm Stärke gefertigt, schützen sie Unterlagen effektiv und ermöglichen einen sicheren Verschluss über den Druckknopf. Das Set enthält 5 Mappen, geeignet für Schule, Büro oder Archivierung.`,
    specs: [['Format', 'A4'], ['Închidere', 'Capsă'], ['Material', 'PP'], ['Grosime', '180 μm'], ['Cantitate', '5 mape']],
  },
  {
    id: 'consumabil-6', cod: 'MK-CON-06', category: 'consumabile', img: 'consumabil6', price: 55, oldPrice: 69,
    name: `Cartuș Canon CLI-581 XXL CMYK, PGI-580 XXL, 5-pack`,
    description: `Setul de cartușe cu cerneală CLI-581/PGI-580 este compatibil cu imprimantele Canon și conține cartușe în variantă multipack. Acesta oferă imprimări clare și culori de calitate, fiind potrivit atât pentru documente, cât și pentru imagini.`,
    name_en: `Canon CLI-581 XXL CMYK, PGI-580 XXL Ink Cartridge, 5-pack`,
    description_en: `The CLI-581/PGI-580 ink cartridge set is compatible with Canon printers and comes as a multipack. It delivers crisp prints and quality colors, suitable for both documents and images.`,
    name_es: `Cartucho de tinta Canon CLI-581 XXL CMYK, PGI-580 XXL, pack de 5`,
    description_es: `El set de cartuchos de tinta CLI-581/PGI-580 es compatible con impresoras Canon y se presenta en formato multipack. Ofrece impresiones nítidas y colores de calidad, siendo adecuado tanto para documentos como para imágenes.`,
    name_de: `Canon CLI-581 XXL CMYK, PGI-580 XXL Tintenpatrone, 5er-Pack`,
    description_de: `Das Tintenpatronen-Set CLI-581/PGI-580 ist kompatibel mit Canon-Druckern und wird als Multipack angeboten. Es liefert klare Drucke und hochwertige Farben, geeignet sowohl für Dokumente als auch für Bilder.`,
    specs: [['Model', 'CLI-581 XXL CMYK, PGI-580 XXL'], ['Pachet', '5-pack (multipack)'], ['Compatibilitate', 'Imprimante Canon'], ['Tip', 'Cartușe cu cerneală']],
  },
];

/* Produsele afișate pe pagina principală */
const FEATURED_IDS = ['laptop-2', 'laptop-5', 'monitor-4', 'unitate-5', 'periferic-2', 'monitor-6'];
const DEAL_IDS = ['monitor-2', 'periferic-5', 'unitate-2', 'laptop-3', 'consumabil-6'];

/* =====================================================================
   3. UTILITARE
   ===================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const productById = (id) => PRODUCTS.find((p) => p.id === id);
const categoryById = (id) => CATEGORIES.find((c) => c.id === id);
const productsInCategory = (catId) => PRODUCTS.filter((p) => p.category === catId);

/* Calea către o imagine din folderul de imagini */
const imgPath = (file) => CONFIG.imageFolder + file;

/* Cele 4 poze ale unui produs: monitor1(1).png ... monitor1(4).png */
const productImages = (p) => [1, 2, 3, 4].map((n) => imgPath(`${p.img}(${n}).png`));

/* Preț în format românesc: 699 lei, 4599 lei, 10.159 lei (ca în catalog) */
function formatPrice(value) {
  const rounded = Math.round(value);
  const str = String(rounded);
  const grouped = rounded >= 10000 ? str.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : str;
  return `${grouped} lei`;
}

const discountPercent = (p) => (p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0);

/* Escapare pentru textele puse în HTML generat din JS */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Normalizare text pentru căutare: fără diacritice (ă â î ș ț, inclusiv ş ţ cu sedilă),
   litere mici, ghilimele/semne unificate, spații comprimate */
function normalizeText(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[”“„″"'’`]/g, '"')
    .replace(/×/g, 'x')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Scurtează un text la o limită, fără să taie cuvinte */
function truncate(str, max = 110) {
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:–—-]+$/, '') + '…';
}

/* Imagine lipsă → înlocuită cu un placeholder discret (până adaugi pozele) */
const IMG_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320"><rect width="400" height="320" fill="#f1f4f9"/>' +
      '<g fill="none" stroke="#b6c2d4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="130" y="95" width="140" height="110" rx="14"/><circle cx="170" cy="135" r="12"/><path d="m140 195 45-45 30 30 20-20 25 25"/></g>' +
      '<text x="200" y="245" font-family="system-ui,sans-serif" font-size="18" fill="#8a97ab" text-anchor="middle">Imagine indisponibilă</text></svg>'
  );

function imgFallback(img) {
  img.onerror = null;
  img.src = IMG_PLACEHOLDER;
  img.classList.add('is-placeholder');
}

/* Pozele echipei: dacă fișierul .png nu există, mai încercăm o dată cu .jpg
   (și invers), ca să nu conteze în ce format ai salvat poza. */
function photoFallback(img) {
  const src = img.getAttribute('src') || '';
  if (!img.dataset.altExt) {
    img.dataset.altExt = '1';
    if (src.endsWith('.png')) {
      img.src = src.replace(/\.png$/, '.jpg');
      return;
    }
    if (src.endsWith('.jpg')) {
      img.src = src.replace(/\.jpg$/, '.png');
      return;
    }
  }
  imgFallback(img);
}

/* Poză de știre lipsă → rămâne blocul gri cu „Imagine în curând”
   (încercăm întâi și varianta .jpg a fișierului) */
function newsImageFallback(img) {
  const src = img.getAttribute('src') || '';
  if (!img.dataset.altExt && src.endsWith('.png')) {
    img.dataset.altExt = '1';
    img.src = src.replace(/\.png$/, '.jpg');
    return;
  }
  img.remove();
}

/* Banner lipsă → rămâne vizibil fundalul de rezervă */
function bannerFallback(img) {
  img.classList.add('is-missing');
}

/* Logo lipsă → logo text (MK + TECH) */
function logoFallback(img) {
  const wrap = img.closest('.brand-logo');
  if (wrap) wrap.classList.add('brand-logo--text');
  img.remove();
}

/* localStorage protejat (poate fi blocat în modul privat) */
const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* stocare indisponibilă — site-ul continuă să funcționeze în sesiunea curentă */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  },
};

const STORAGE_KEYS = {
  cart: 'mktech_cart',
  favorites: 'mktech_favorites',
  users: 'mktech_users',
  session: 'mktech_session',
  lang: 'mktech_lang',
};

/* Iconițe SVG inline (fără librării externe) */
const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  heart: '<path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4Z"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3h2.6l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1L21 7.5H6.1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a3 3 0 0 1-3 3h-3"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="12.5" rx="1.5"/><path d="M8 21h8M12 16.5V21"/>',
  mouse: '<rect x="6" y="2.5" width="12" height="19" rx="6"/><path d="M12 6.5v4"/>',
  cpu: '<rect x="6" y="2.5" width="12" height="19" rx="1.5"/><path d="M9.5 6.5h5M9.5 10h5"/><circle cx="12" cy="16.5" r="1.2"/>',
  laptop: '<rect x="4.5" y="4.5" width="15" height="10.5" rx="1.2"/><path d="M2 19h20"/>',
  pen: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5 12-12Z"/>',
  mapPin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  phone: '<path d="M5 3.5h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.8 6.8l1.4-2.2 4.3 1.7V19a1.9 1.9 0 0 1-2 2A16.6 16.6 0 0 1 3 5.5a1.9 1.9 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  printer: '<path d="M7 9V3.5h10V9M7 18H5.5A1.5 1.5 0 0 1 4 16.5V11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5.5a1.5 1.5 0 0 1-1.5 1.5H17"/><rect x="7" y="14" width="10" height="6.5" rx="1"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3.5V7M16 3.5V7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  bag: '<path d="M5 8h14l-1 12.5H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14a6.5 6.5 0 0 1 3 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  news: '<path d="M4 5h11v14H4zM15 9h4a1 1 0 0 1 1 1v7.5a1.5 1.5 0 0 1-3 0V9"/><path d="M7 9h5M7 12.5h5M7 16h3"/>',
  tag: '<path d="M3 12.2V4a1 1 0 0 1 1-1h8.2a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-8.2 8.2a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
};

/* Logo-urile rețelelor sociale (pline, nu conturate) */
const BRAND_ICONS = {
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 4.6a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4Zm0 8.6a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Zm5.4-9.9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a8 8 0 0 0 4.6 1.5V6.7A4.6 4.6 0 0 1 16.6 2Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13.5 21.9v-7.6h2.6l.4-3h-3V9.4c0-.9.3-1.5 1.5-1.5h1.6V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6v7.6C5.6 21.2 2 17 2 12 2 6.5 6.5 2 12 2s10 4.5 10 10c0 5-3.6 9.2-8.5 9.9Z"/></svg>',
};

function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

/* Înlocuiește <span data-icon="phone"></span> din HTML cu iconița SVG
   și <span data-logo></span> cu logo-ul MKTech */
function hydrateIcons(root = document) {
  $$('[data-icon]', root).forEach((el) => (el.outerHTML = icon(el.dataset.icon)));
  $$('[data-logo]', root).forEach((el) => (el.outerHTML = logoMarkup()));
}

/* =====================================================================
   4. COȘ, FAVORITE, CONT
   ===================================================================== */

/* ---------- Coș: [{ id, qty }] în localStorage ---------- */
const Cart = {
  items() {
    const raw = storage.get(STORAGE_KEYS.cart, []);
    return Array.isArray(raw) ? raw.filter((it) => productById(it.id) && it.qty > 0) : [];
  },
  save(items) {
    storage.set(STORAGE_KEYS.cart, items);
    document.dispatchEvent(new CustomEvent('cart:change'));
  },
  count() {
    return this.items().reduce((sum, it) => sum + it.qty, 0);
  },
  add(id, qty = 1) {
    const items = this.items();
    const line = items.find((it) => it.id === id);
    if (line) line.qty = Math.min(CONFIG.maxQty, line.qty + qty);
    else items.push({ id, qty: Math.min(CONFIG.maxQty, qty) });
    this.save(items);
  },
  setQty(id, qty) {
    const items = this.items();
    const line = items.find((it) => it.id === id);
    if (!line) return;
    line.qty = Math.max(1, Math.min(CONFIG.maxQty, qty));
    this.save(items);
  },
  remove(id) {
    this.save(this.items().filter((it) => it.id !== id));
  },
  clear() {
    this.save([]);
  },
  totals() {
    return this.items().reduce(
      (acc, it) => {
        const p = productById(it.id);
        acc.total += p.price * it.qty;
        acc.savings += p.oldPrice ? (p.oldPrice - p.price) * it.qty : 0;
        acc.count += it.qty;
        return acc;
      },
      { total: 0, savings: 0, count: 0 }
    );
  },
};

/* ---------- Favorite: [id, id, ...] în localStorage ---------- */
const Favorites = {
  ids() {
    const raw = storage.get(STORAGE_KEYS.favorites, []);
    return Array.isArray(raw) ? raw.filter((id) => productById(id)) : [];
  },
  has(id) {
    return this.ids().includes(id);
  },
  toggle(id) {
    const ids = this.ids();
    const exists = ids.includes(id);
    const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
    storage.set(STORAGE_KEYS.favorites, next);
    document.dispatchEvent(new CustomEvent('favorites:change'));
    return !exists;
  },
  remove(id) {
    storage.set(STORAGE_KEYS.favorites, this.ids().filter((x) => x !== id));
    document.dispatchEvent(new CustomEvent('favorites:change'));
  },
};

/* ---------- Cont utilizator (DOAR local, în browser) ----------
   ⚠️ ATENȚIE — CONT DEMONSTRATIV, NU SIGUR:
   - Site-ul e static (fără server), deci conturile sunt salvate în localStorage,
     NECRIPTAT (inclusiv parola), doar în browserul în care au fost create.
   - Oricine are acces la acel browser poate vedea datele (DevTools → Application → Local Storage).
   - Contul NU există pe alt dispozitiv/browser și dispare dacă se șterg datele site-ului.
   - Nu folosi niciodată o parolă reală pe care o ai și în alte conturi.
   Pentru conturi reale ai nevoie de un serviciu extern de autentificare
   (ex. Firebase Authentication sau Supabase Auth) — vezi explicația din răspuns / README. */
const Auth = {
  users() {
    const raw = storage.get(STORAGE_KEYS.users, []);
    return Array.isArray(raw) ? raw : [];
  },
  current() {
    const session = storage.get(STORAGE_KEYS.session, null);
    if (!session || !session.email) return null;
    return this.users().find((u) => u.email === session.email) || null;
  },
  register({ name, email, password }) {
    const users = this.users();
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalizedEmail)) {
      return { ok: false, field: 'email', message: 'Există deja un cont cu acest email.' };
    }
    const user = { name: name.trim(), email: normalizedEmail, password, createdAt: new Date().toISOString() };
    storage.set(STORAGE_KEYS.users, [...users, user]);
    storage.set(STORAGE_KEYS.session, { email: normalizedEmail });
    document.dispatchEvent(new CustomEvent('auth:change'));
    return { ok: true, user };
  },
  login(email, password) {
    const user = this.users().find((u) => u.email === email.trim().toLowerCase());
    if (!user) return { ok: false, field: 'email', message: 'Nu există niciun cont cu acest email.' };
    if (user.password !== password) return { ok: false, field: 'password', message: 'Parola este incorectă.' };
    storage.set(STORAGE_KEYS.session, { email: user.email });
    document.dispatchEvent(new CustomEvent('auth:change'));
    return { ok: true, user };
  },
  logout() {
    storage.remove(STORAGE_KEYS.session);
    document.dispatchEvent(new CustomEvent('auth:change'));
  },
};

/* =====================================================================
   5. HEADER, NAVIGARE, FOOTER (injectate pe toate paginile)
   Fiecare pagină are <div id="site-header"></div> și <div id="site-footer"></div>;
   le completăm de aici ca să modifici meniul/footer-ul într-un singur loc.
   ===================================================================== */
function logoMarkup(extraClass = '') {
  /* --logo-url = aceeași imagine, folosită drept „mască” pentru animația de luciu (vezi style.css) */
  return `<span class="brand-logo ${extraClass}" style="--logo-url: url('${imgPath('logo.png')}')"><img src="${imgPath(
    'logo.png'
  )}" alt="MKTech" width="500" height="500" onerror="logoFallback(this)"><span class="brand-logo__shine" aria-hidden="true"></span><span class="brand-logo__text" aria-hidden="true"><b>M</b><i>K</i><small>TECH</small></span></span>`;
}

/* Comutatorul de limbă din colțul dreapta al barei de navigare */
function langSwitchMarkup() {
  const current = LANGS.find((l) => l.code === CURRENT_LANG) || LANGS[0];
  return `
  <div class="lang-switch" data-lang-switch>
    <button class="lang-switch__toggle" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Schimbă limba site-ului">
      ${icon('globe')}<span class="lang-switch__code">${current.short}</span>${icon('chevronDown', 'lang-switch__chevron')}
    </button>
    <ul class="lang-switch__menu" hidden>
      ${LANGS.map(
        (l) => `<li><button class="lang-switch__option${l.code === CURRENT_LANG ? ' is-active' : ''}" type="button" data-lang="${l.code}"
          ${l.code === CURRENT_LANG ? 'aria-current="true"' : ''}><span class="lang-switch__short">${l.short}</span><span>${l.label}</span>${
          l.code === CURRENT_LANG ? icon('check', 'lang-switch__check') : ''
        }</button></li>`
      ).join('')}
    </ul>
  </div>`;
}

function headerMarkup() {
  const page = document.body.dataset.page || '';
  const isActive = (name) => (page === name ? ' is-active' : '');
  const categoryLinks = CATEGORIES.map(
    (c) => `<li><a href="produse.html#${c.id}">${icon(c.icon)}<span>${categoryName(c)}<small>${productsInCategory(c.id).length} produse</small></span></a></li>`
  ).join('');

  return `
  <a class="skip-link" href="#main">Sari la conținut</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="MKTech — pagina principală">
        ${logoMarkup()}
        <span class="brand-motto">Soluții smart pentru birou!</span>
      </a>

      <div class="search" data-search>
        <form class="search-form" action="produse.html" method="get" role="search" autocomplete="off">
          <label class="visually-hidden" for="site-search">Caută produse</label>
          ${icon('search', 'search-form__icon')}
          <input id="site-search" class="search-form__input" name="q" type="search" placeholder="Caută monitoare, laptopuri…"
            role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-results" enterkeyhint="search">
          <button class="search-form__clear" type="button" aria-label="Șterge căutarea" hidden>${icon('close')}</button>
        </form>
        <div class="search-results" id="search-results" hidden></div>
      </div>

      <nav class="header-actions" aria-label="Cont, favorite și coș">
        <a class="header-action${isActive('cont')}" href="cont.html">
          <span class="header-action__icon">${icon('user')}</span>
          <span class="header-action__label" data-account-label>Cont</span>
        </a>
        <a class="header-action${isActive('favorite')}" href="favorite.html">
          <span class="header-action__icon">${icon('heart')}<span class="count-badge count-badge--accent" data-fav-count hidden>0</span></span>
          <span class="header-action__label">Favorite</span>
        </a>
        <a class="header-action${isActive('cos')}" href="cos.html">
          <span class="header-action__icon">${icon('cart')}<span class="count-badge" data-cart-count hidden>0</span></span>
          <span class="header-action__label">Coș</span>
        </a>
      </nav>
    </div>
  </header>

  <nav class="main-nav" aria-label="Navigare principală">
    <div class="container main-nav__inner">
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">
        <span class="nav-toggle__open">${icon('menu')}</span><span class="nav-toggle__close">${icon('close')}</span>
        <span>Meniu</span>
      </button>

      <ul class="nav-menu" id="nav-menu">
        <li class="nav-item nav-item--dropdown">
          <button class="nav-link nav-dropdown-toggle${isActive('produse')}${isActive('produs')}" type="button" aria-expanded="false" aria-controls="nav-dropdown-produse">
            Produse ${icon('chevronDown', 'nav-link__chevron')}
          </button>
          <div class="nav-dropdown" id="nav-dropdown-produse">
            <ul class="nav-dropdown__list">${categoryLinks}
              <li><a href="reduceri.html">${icon('tag')}<span>Reduceri<small>${PRODUCTS.filter((p) => p.oldPrice).length} produse</small></span></a></li>
            </ul>
            <a class="nav-dropdown__all" href="produse.html">Vezi toate produsele ${icon('arrowRight')}</a>
          </div>
        </li>
        <li class="nav-item"><a class="nav-link${isActive('acasa')}" href="index.html">Acasă</a></li>
        <li class="nav-item nav-item--dropdown">
          <a class="nav-link nav-dropdown-toggle${isActive('despre')}${isActive('organigrama')}${isActive('galerie')}" href="despre.html"
            aria-expanded="false" aria-controls="nav-dropdown-despre">
            Despre noi ${icon('chevronDown', 'nav-link__chevron')}
          </a>
          <div class="nav-dropdown nav-dropdown--simple" id="nav-dropdown-despre">
            <ul class="nav-dropdown__list">
              <li><a href="despre.html">${icon('info')}<span>Despre noi<small>Povestea și valorile firmei</small></span></a></li>
              <li><a href="organigrama.html">${icon('users')}<span>Organigramă<small>Echipa și structura firmei</small></span></a></li>
              <li><a href="galerie.html">${icon('sparkle')}<span>Galerie foto<small>Poze de la evenimente</small></span></a></li>
            </ul>
          </div>
        </li>
        <li class="nav-item"><a class="nav-link${isActive('noutati')}" href="noutati.html">Forum de noutăți</a></li>
        <li class="nav-item"><a class="nav-link${isActive('contact')}" href="contact.html">Contact</a></li>
      </ul>

      ${langSwitchMarkup()}

      <a class="main-nav__cart" href="cos.html" aria-label="Coșul de cumpărături">
        ${icon('cart')}<span class="count-badge count-badge--light" data-cart-count hidden>0</span>
      </a>
    </div>
  </nav>`;
}

function footerMarkup() {
  const year = new Date().getFullYear();
  const socialItem = (key, label) => {
    const href = CONFIG.social[key];
    const external = /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener"' : '';
    return `<li><a class="social-link" href="${escapeHTML(href)}"${external} aria-label="MKTech pe ${label}">${BRAND_ICONS[key]}</a></li>`;
  };

  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="footer-brand__logo" href="index.html" aria-label="MKTech — pagina principală">${logoMarkup('brand-logo--footer')}</a>
        <p class="footer-brand__name">MKTech</p>
        <p class="footer-brand__text">Echipamente IT și de birou: monitoare, periferice, unități PC, laptopuri, consumabile și rechizite.</p>
        <!-- Link-urile social media se completează în script.js → CONFIG.social (sus, în secțiunea 1) -->
        <ul class="social-list">
          ${socialItem('instagram', 'Instagram')}
          ${socialItem('tiktok', 'TikTok')}
          ${socialItem('facebook', 'Facebook')}
        </ul>
      </div>

      <div class="footer-col">
        <h2 class="footer-col__title">Categorii</h2>
        <ul>${CATEGORIES.map((c) => `<li><a href="produse.html#${c.id}">${categoryName(c)}</a></li>`).join('')}
          <li><a href="reduceri.html">Reduceri</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h2 class="footer-col__title">Companie</h2>
        <ul>
          <li><a href="index.html">Acasă</a></li>
          <li><a href="produse.html">Toate produsele</a></li>
          <li><a href="despre.html">Despre noi</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="noutati.html">Forum de noutăți</a></li>
          <li><a href="lista-preturi.html">Listă de prețuri</a></li>
          <li><a href="organigrama.html">Organigramă</a></li>
          <li><a href="galerie.html">Galerie foto</a></li>
          <li><a href="ghid-site.html">Ghid site</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h2 class="footer-col__title">Contul meu</h2>
        <ul>
          <li><a href="cont.html">Autentificare / cont</a></li>
          <li><a href="favorite.html">Produse favorite</a></li>
          <li><a href="cos.html">Coșul de cumpărături</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container footer-bottom__inner">
        <p>Proiect firmă de exercițiu — MKTech © ${year}</p>
        <p class="footer-bottom__updated">Ultima actualizare: ${escapeHTML(ULTIMA_ACTUALIZARE)}</p>
        <p class="footer-bottom__note">${icon('info')} Magazin demonstrativ: comenzile și plățile sunt simulate.</p>
      </div>
    </div>
  </footer>`;
}

function mountLayout() {
  const headerSlot = $('#site-header');
  if (headerSlot) headerSlot.outerHTML = headerMarkup();

  const footerSlot = $('#site-footer');
  if (footerSlot) footerSlot.outerHTML = footerMarkup();

  if (!$('.toast-region')) {
    document.body.insertAdjacentHTML('beforeend', '<div class="toast-region" aria-live="polite" aria-atomic="false"></div>');
  }
}

/* Contoarele din header (coș + favorite) și numele contului */
function updateHeaderState() {
  const cartCount = Cart.count();
  $$('[data-cart-count]').forEach((el) => {
    el.textContent = cartCount > 99 ? '99+' : cartCount;
    el.hidden = cartCount === 0;
  });

  const favCount = Favorites.ids().length;
  $$('[data-fav-count]').forEach((el) => {
    el.textContent = favCount;
    el.hidden = favCount === 0;
  });

  const user = Auth.current();
  $$('[data-account-label]').forEach((el) => {
    el.textContent = user ? user.name.split(' ')[0] : 'Cont';
    el.title = user ? `Autentificat ca ${user.name}` : '';
  });
  $$('.header-action[href="cont.html"]').forEach((el) => el.classList.toggle('is-logged', !!user));
}

function bumpBadge(selector) {
  $$(selector).forEach((el) => {
    el.classList.remove('is-bumping');
    void el.offsetWidth; // repornește animația
    el.classList.add('is-bumping');
  });
}

/* Comutatorul de limbă: deschide meniul, salvează alegerea și reîncarcă pagina */
function initLangSwitch() {
  const wrap = $('[data-lang-switch]');
  if (!wrap) return;
  const toggle = $('.lang-switch__toggle', wrap);
  const menu = $('.lang-switch__menu', wrap);

  const setOpen = (open) => {
    menu.hidden = !open;
    wrap.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(menu.hidden));
  $$('.lang-switch__option', wrap).forEach((btn) => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) setOpen(false);
  });
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* Meniu mobil (hamburger) + dropdown „Produse” */
function initNavigation() {
  const nav = $('.main-nav');
  if (!nav) return;
  const toggle = $('.nav-toggle', nav);
  const dropdownItems = $$('.nav-item--dropdown', nav);
  const desktop = window.matchMedia('(min-width: 992px)');

  const menu = $('.nav-menu', nav);

  // Meniul mobil ocupă exact spațiul rămas sub bara de navigare (și derulează în interior)
  const fitMenu = () => {
    if (desktop.matches || !nav.classList.contains('is-open')) {
      menu.style.maxHeight = '';
      return;
    }
    menu.style.maxHeight = `${Math.max(200, window.innerHeight - nav.getBoundingClientRect().bottom)}px`;
  };

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-locked', open && !desktop.matches);
    fitMenu();
  };
  window.addEventListener('resize', fitMenu);
  const setDropdown = (item, open) => {
    item.classList.toggle('is-open', open);
    $('.nav-dropdown-toggle', item).setAttribute('aria-expanded', String(open));
  };

  const inchideDropdownuri = (except) => dropdownItems.forEach((item) => item !== except && setDropdown(item, false));

  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));

  dropdownItems.forEach((item) => {
    const buton = $('.nav-dropdown-toggle', item);
    buton.addEventListener('click', (e) => {
      /* pe mobil, click-ul deschide/închide lista; pe desktop, linkul duce la pagină */
      if (!desktop.matches && buton.tagName === 'A') e.preventDefault();
      const deschis = item.classList.contains('is-open');
      inchideDropdownuri(item);
      setDropdown(item, !deschis);
      fitMenu();
    });
  });

  // Pe mobil, listele din meniu sunt deschise implicit, ca acordeon
  if (!desktop.matches) dropdownItems.forEach((item) => setDropdown(item, true));

  // Închide la click pe un link (util pentru ancorele de pe aceeași pagină)
  $$('.nav-menu a', nav).forEach((a) =>
    a.addEventListener('click', () => {
      if (a.classList.contains('nav-dropdown-toggle') && !desktop.matches) return;
      setMenu(false);
      if (desktop.matches) inchideDropdownuri();
    })
  );

  // Închide la click în afară / Escape
  document.addEventListener('click', (e) => {
    if (!desktop.matches) return;
    dropdownItems.forEach((item) => {
      if (!item.contains(e.target)) setDropdown(item, false);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (desktop.matches) {
      dropdownItems.forEach((item) => {
        if (item.classList.contains('is-open')) {
          setDropdown(item, false);
          $('.nav-dropdown-toggle', item).focus();
        }
      });
    }
    if (nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Pe desktop, dropdown-ul se închide când focusul iese din el
  dropdownItems.forEach((item) =>
    item.addEventListener('focusout', (e) => {
      if (desktop.matches && !item.contains(e.relatedTarget)) setDropdown(item, false);
    })
  );

  desktop.addEventListener('change', () => {
    setMenu(false);
    dropdownItems.forEach((item) => setDropdown(item, !desktop.matches));
  });
}

/* =====================================================================
   6. CĂUTARE LIVE
   Caută în toate cele 30 de produse, după nume (plus numele categoriei și
   tipul produsului, ca „monitor” să găsească toate monitoarele și „imprimantă”
   imprimanta). Ignoră majusculele și diacriticele; mai multe cuvinte = toate
   trebuie să apară (în orice ordine). Potrivirile din nume apar primele.
   ===================================================================== */
/* Indexul se construiește la pornire, în funcție de limba aleasă: căutarea
   găsește produsele atât după numele românesc, cât și după cel tradus. */
let SEARCH_INDEX = [];

function buildSearchIndex() {
  SEARCH_INDEX = PRODUCTS.map((p, index) => {
    const cat = categoryById(p.category);
    const type = (p.specs.find(([label]) => label === 'Tip') || [])[1] || '';
    const catNames = [cat.name, cat.singular, cat.shortName || '', categoryName(cat), categoryName(cat, true)];
    return {
      product: p,
      index,
      name: normalizeText(`${productName(p)} ${p.name}`),
      extra: normalizeText(`${catNames.join(' ')} ${type} ${translateString(type) || ''}`),
    };
  });
}

function searchTokens(query) {
  return normalizeText(query).split(' ').filter(Boolean);
}

function searchProducts(query) {
  const tokens = searchTokens(query);
  if (!tokens.length) return [];

  return SEARCH_INDEX.map((entry) => {
    if (!tokens.every((t) => entry.name.includes(t) || entry.extra.includes(t))) return null;
    let score = 0;
    tokens.forEach((t) => {
      if (entry.name.includes(t)) score += 10;
      if (entry.name.startsWith(t) || entry.name.includes(' ' + t)) score += 4; // început de cuvânt
    });
    return { product: entry.product, score, index: entry.index };
  })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.product);
}

/* Evidențiază termenii căutați în numele original (cu diacritice păstrate) */
function highlightMatches(text, query) {
  const tokens = searchTokens(query);
  if (!tokens.length) return escapeHTML(text);

  // normalizăm caracter cu caracter, ca pozițiile să corespundă textului original
  const chars = [...text];
  const normChars = chars.map((ch, i) => {
    if (ch === ',' && /\d/.test(chars[i - 1] || '') && /\d/.test(chars[i + 1] || '')) return '.';
    const n = normalizeText(ch);
    return n.length === 1 ? n : ch === ' ' || /\s/.test(ch) ? ' ' : n.charAt(0) || ch;
  });
  const haystack = normChars.join('');
  const marked = new Array(chars.length).fill(false);

  tokens.forEach((t) => {
    let from = 0;
    let pos;
    while ((pos = haystack.indexOf(t, from)) !== -1) {
      for (let i = pos; i < pos + t.length; i++) marked[i] = true;
      from = pos + t.length;
    }
  });

  let html = '';
  let open = false;
  chars.forEach((ch, i) => {
    if (marked[i] && !open) {
      html += '<mark>';
      open = true;
    }
    if (!marked[i] && open) {
      html += '</mark>';
      open = false;
    }
    html += escapeHTML(ch);
  });
  return open ? html + '</mark>' : html;
}

function initSearch() {
  const wrap = $('[data-search]');
  if (!wrap) return;
  const form = $('.search-form', wrap);
  const input = $('.search-form__input', wrap);
  const clearBtn = $('.search-form__clear', wrap);
  const panel = $('.search-results', wrap);
  let activeIndex = -1;

  const options = () => $$('.search-result', panel);

  const close = () => {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  };

  const setActive = (i) => {
    const opts = options();
    if (!opts.length) return;
    activeIndex = (i + opts.length) % opts.length;
    opts.forEach((o, idx) => o.classList.toggle('is-active', idx === activeIndex));
    const current = opts[activeIndex];
    input.setAttribute('aria-activedescendant', current.id);
    current.scrollIntoView({ block: 'nearest' });
  };

  const render = () => {
    const query = input.value;
    clearBtn.hidden = query.length === 0;
    activeIndex = -1;

    if (!query.trim()) {
      close();
      return;
    }

    const results = searchProducts(query);
    if (!results.length) {
      panel.innerHTML = `
        <div class="search-empty">
          ${icon('search')}
          <p><strong>Niciun produs găsit</strong> pentru „${escapeHTML(query.trim())}”.</p>
          <p class="search-empty__hint">Verifică ortografia sau încearcă un termen mai general (ex. „monitor”, „laptop”, „mouse”).</p>
        </div>`;
    } else {
      const label = results.length === 1 ? '1 produs găsit' : `${results.length} produse găsite`;
      panel.innerHTML = `
        <p class="search-results__head">${label}</p>
        <ul class="search-results__list" role="listbox" aria-label="Rezultate căutare">
          ${results
            .map((p) => {
              const img = productImages(p)[0];
              return `<li role="presentation">
                <a class="search-result" id="search-opt-${p.id}" role="option" href="produs.html?id=${p.id}">
                  <span class="search-result__media"><img src="${img}" alt="" loading="lazy" onerror="imgFallback(this)"></span>
                  <span class="search-result__text">
                    <span class="search-result__name">${highlightMatches(productName(p), query)}</span>
                    <span class="search-result__cat">${categoryName(categoryById(p.category))}</span>
                  </span>
                  <span class="search-result__price">
                    ${p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : ''}
                    <b>${formatPrice(p.price)}</b>
                  </span>
                </a>
              </li>`;
            })
            .join('')}
        </ul>
        <a class="search-results__all" href="produse.html?q=${encodeURIComponent(query.trim())}">Vezi rezultatele în catalog ${icon('arrowRight')}</a>`;
    }
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  input.addEventListener('input', render);
  input.addEventListener('focus', () => {
    if (input.value.trim()) render();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (panel.hidden) render();
      setActive(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(activeIndex - 1);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      window.location.href = options()[activeIndex].href;
    } else if (e.key === 'Escape') {
      if (!panel.hidden) {
        e.preventDefault();
        close();
      }
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });

  form.addEventListener('submit', (e) => {
    const query = input.value.trim();
    if (!query) {
      e.preventDefault();
      input.focus();
      return;
    }
    // Pe pagina de produse filtrăm direct, fără reîncărcare
    if (document.body.dataset.page === 'produse' && typeof window.applyCatalogFilter === 'function') {
      e.preventDefault();
      close();
      input.blur();
      window.applyCatalogFilter(query, true);
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });
  wrap.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !wrap.contains(e.relatedTarget)) close();
  });
}

/* =====================================================================
   7. CARD PRODUS + NOTIFICĂRI
   ===================================================================== */
function priceMarkup(p, cls = '') {
  return `<div class="price ${cls}">
    ${p.oldPrice ? `<span class="price__old"><span class="visually-hidden">Preț vechi: </span>${formatPrice(p.oldPrice)}</span>` : ''}
    <span class="price__now${p.oldPrice ? ' price__now--sale' : ''}">${p.oldPrice ? '<span class="visually-hidden">Preț nou: </span>' : ''}${formatPrice(p.price)}</span>
  </div>`;
}

function favButtonMarkup(p, cls = '') {
  const active = Favorites.has(p.id);
  return `<button class="fav-btn ${cls}${active ? ' is-active' : ''}" type="button" data-fav="${p.id}"
    aria-pressed="${active}" aria-label="${active ? 'Elimină de la favorite' : 'Adaugă la favorite'}: ${escapeHTML(productName(p))}"
    title="${active ? 'Elimină de la favorite' : 'Adaugă la favorite'}">${icon('heart')}</button>`;
}

/* Cardul de produs — același pe index, produse, favorite
   options.variant = 'favorite' → afișează și butonul „Elimină” */
function productCardMarkup(p, options = {}) {
  const cat = categoryById(p.category);
  const url = `produs.html?id=${p.id}`;
  const img = productImages(p)[0];
  const discount = discountPercent(p);
  const removeBtn =
    options.variant === 'favorite'
      ? `<button class="btn btn--ghost btn--sm card-remove" type="button" data-fav-remove="${p.id}" aria-label="Elimină de la favorite: ${escapeHTML(productName(p))}">${icon('trash')}<span>Elimină</span></button>`
      : '';

  return `
  <article class="product-card${p.oldPrice ? ' product-card--sale' : ''}" data-product="${p.id}">
    <div class="product-card__media">
      <img src="${img}" alt="${escapeHTML(productName(p))}" loading="lazy" onerror="imgFallback(this)">
      ${discount ? `<span class="discount-badge">-${discount}%</span>` : ''}
    </div>
    ${favButtonMarkup(p, 'product-card__fav')}
    <div class="product-card__body">
      <span class="product-card__cat">${categoryName(cat, true)}</span>
      <h3 class="product-card__title"><a href="${url}" class="product-card__link">${escapeHTML(productName(p))}</a></h3>
      <p class="product-card__desc">${escapeHTML(truncate(productDescription(p), 115))}</p>
      <div class="product-card__footer">
        ${priceMarkup(p)}
        <div class="product-card__actions">
          <button class="btn btn--primary btn--add" type="button" data-add-to-cart="${p.id}">
            ${icon('cart')}<span class="btn__label">Adaugă în coș</span>
          </button>
          ${removeBtn}
        </div>
      </div>
    </div>
  </article>`;
}

function renderGrid(container, products, options) {
  if (!container) return;
  container.innerHTML = products.map((p) => productCardMarkup(p, options)).join('');
}

/* Notificare mică (toast), în colțul ecranului */
function showToast({ title, message = '', type = 'success', action = null, duration = 3200 }) {
  const region = $('.toast-region');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <span class="toast__icon">${icon(type === 'success' ? 'check' : type === 'fav' ? 'heart' : 'info')}</span>
    <div class="toast__body">
      <p class="toast__title">${escapeHTML(title)}</p>
      ${message ? `<p class="toast__msg">${escapeHTML(message)}</p>` : ''}
    </div>
    ${action ? `<a class="toast__action" href="${action.href}">${escapeHTML(action.label)}</a>` : ''}
    <button class="toast__close" type="button" aria-label="Închide notificarea">${icon('close')}</button>`;

  const remove = () => {
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 250);
  };
  $('.toast__close', toast).addEventListener('click', remove);
  region.appendChild(toast);
  // maximum 3 notificări simultan
  while (region.children.length > 3) region.firstElementChild.remove();
  setTimeout(remove, duration);
}

/* Actualizează vizual toate inimioarele unui produs de pe pagină */
function syncFavButtons(id) {
  const active = Favorites.has(id);
  const p = productById(id);
  $$(`[data-fav="${id}"]`).forEach((btn) => {
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
    const label = active ? 'Elimină de la favorite' : 'Adaugă la favorite';
    btn.setAttribute('aria-label', `${label}: ${productName(p)}`);
    btn.title = label;
    const text = $('.fav-btn__text', btn);
    if (text) text.textContent = active ? 'În favorite' : 'Favorite';
  });
}

function handleAddToCart(id, qty = 1, button = null) {
  const p = productById(id);
  if (!p) return;
  Cart.add(id, qty);
  bumpBadge('[data-cart-count]');
  showToast({
    title: 'Adăugat în coș',
    message: qty > 1 ? `${qty} × ${productName(p)}` : productName(p),
    action: { href: 'cos.html', label: 'Vezi coșul' },
  });
  if (button) {
    const label = $('.btn__label', button);
    if (!label || button.classList.contains('is-added')) return;
    const original = label.textContent;
    button.classList.add('is-added');
    label.textContent = 'Adăugat';
    setTimeout(() => {
      button.classList.remove('is-added');
      label.textContent = original;
    }, 1400);
  }
}

/* Delegare de evenimente: funcționează pentru orice card, oriunde pe site */
function initGlobalActions() {
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn) {
      const qtyInput = addBtn.dataset.qtyFrom ? $(addBtn.dataset.qtyFrom) : null;
      const qty = qtyInput ? Math.max(1, Math.min(CONFIG.maxQty, parseInt(qtyInput.value, 10) || 1)) : 1;
      handleAddToCart(addBtn.dataset.addToCart, qty, addBtn);
      return;
    }

    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      const id = favBtn.dataset.fav;
      const nowActive = Favorites.toggle(id);
      syncFavButtons(id);
      favBtn.classList.remove('is-popping');
      void favBtn.offsetWidth;
      favBtn.classList.add('is-popping');
      if (nowActive) bumpBadge('[data-fav-count]');
      showToast({
        type: 'fav',
        title: nowActive ? 'Salvat la favorite' : 'Eliminat de la favorite',
        message: productName(productById(id)),
        action: nowActive ? { href: 'favorite.html', label: 'Vezi favorite' } : null,
      });
    }
  });

  document.addEventListener('cart:change', updateHeaderState);
  document.addEventListener('favorites:change', updateHeaderState);
  document.addEventListener('auth:change', updateHeaderState);

  // Sincronizare între taburi deschise simultan
  window.addEventListener('storage', (e) => {
    if (!Object.values(STORAGE_KEYS).includes(e.key)) return;
    updateHeaderState();
    PRODUCTS.forEach((p) => syncFavButtons(p.id));
    if (e.key === STORAGE_KEYS.cart) document.dispatchEvent(new CustomEvent('cart:external'));
    if (e.key === STORAGE_KEYS.favorites) document.dispatchEvent(new CustomEvent('favorites:external'));
  });
}

/* =====================================================================
   8. PAGINI
   ===================================================================== */
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function emptyStateMarkup({ iconName, title, text, actionHref, actionLabel, tag = 'h2' }) {
  return `
  <div class="empty-state">
    <span class="empty-state__icon">${icon(iconName)}</span>
    <${tag} class="empty-state__title">${title}</${tag}>
    <p class="empty-state__text">${text}</p>
    ${actionHref ? `<a class="btn btn--primary btn--lg" href="${actionHref}">${actionLabel} ${icon('arrowRight')}</a>` : ''}
  </div>`;
}

/* ---------- 8.1 Pagina principală: carusel + produse ---------- */
function initCarousel(root) {
  if (!root) return;
  const track = $('.carousel__track', root);
  const dotsWrap = $('.carousel__dots', root);

  track.innerHTML = CONFIG.banners
    .map(
      (b, i) => `
      <div class="carousel__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} din ${CONFIG.banners.length}">
        <a class="carousel__link" href="${b.href}" draggable="false">
          <span class="carousel__fallback" aria-hidden="true">
            <span class="carousel__fallback-brand">MK<span>TECH</span></span>
            <span class="carousel__fallback-file">${escapeHTML(b.file)}</span>
          </span>
          <img class="carousel__img" src="${imgPath(b.file)}" alt="${escapeHTML(b.alt)}" draggable="false"
            ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} onerror="bannerFallback(this)">
        </a>
      </div>`
    )
    .join('');

  const slides = $$('.carousel__slide', track);
  const n = slides.length;
  dotsWrap.innerHTML = slides
    .map((_, i) => `<button class="carousel__dot" type="button" aria-label="Arată bannerul ${i + 1}"></button>`)
    .join('');
  const dots = $$('.carousel__dot', dotsWrap);
  if (n < 2) {
    root.classList.add('carousel--single');
    return;
  }

  // Clone la capete pentru buclă continuă (după ultimul vine fluid primul)
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[n - 1].cloneNode(true);
  [firstClone, lastClone].forEach((c) => {
    c.setAttribute('aria-hidden', 'true');
    c.classList.add('is-clone');
    $$('a, button', c).forEach((el) => (el.tabIndex = -1));
    $$('img', c).forEach((img) => img.removeAttribute('loading'));
  });
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  let pos = 1; // poziția în șirul cu clone
  let timer = null;
  let paused = false;

  const setTransform = (animate, offsetPx = 0) => {
    track.classList.toggle('no-transition', !animate);
    track.style.transform = `translate3d(calc(${-pos * 100}% + ${offsetPx}px), 0, 0)`;
  };
  const realIndex = () => (pos - 1 + n) % n;
  const updateDots = () => {
    const current = realIndex();
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i === current ? 'false' : 'true'));
    slides.forEach((s, i) => $$('a', s).forEach((a) => (a.tabIndex = i === current ? 0 : -1)));
  };
  const snapIfClone = () => {
    if (pos <= 0 || pos >= n + 1) {
      pos = pos <= 0 ? n : 1;
      setTransform(false);
      void track.offsetWidth;
    }
  };
  const goTo = (newPos) => {
    snapIfClone();
    pos = newPos;
    setTransform(true);
    updateDots();
    restart();
  };
  const next = () => goTo(pos + 1);
  const prev = () => goTo(pos - 1);

  track.addEventListener('transitionend', (e) => {
    if (e.target === track && e.propertyName === 'transform') snapIfClone();
  });

  function restart() {
    clearTimeout(timer);
    if (paused || prefersReducedMotion() || document.hidden) return;
    timer = setTimeout(next, CONFIG.bannerInterval);
  }

  $('.carousel__btn--prev', root).addEventListener('click', prev);
  $('.carousel__btn--next', root).addEventListener('click', next);
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i + 1)));

  // Pauză la hover / focus / tab ascuns
  root.addEventListener('mouseenter', () => { paused = true; restart(); });
  root.addEventListener('mouseleave', () => { paused = false; restart(); });
  root.addEventListener('focusin', () => { paused = true; restart(); });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) { paused = false; restart(); }
  });
  document.addEventListener('visibilitychange', restart);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Swipe (touch + mouse)
  const viewport = $('.carousel__viewport', root);
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dragging = false;
  let horizontal = null;
  let suppressClick = false;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    snapIfClone();
    dragging = true;
    horizontal = null;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    clearTimeout(timer);
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (horizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal) viewport.setPointerCapture(e.pointerId);
    }
    if (horizontal) setTransform(false, dx);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    if (!horizontal) { restart(); return; }
    suppressClick = Math.abs(dx) > 6;
    const threshold = Math.min(80, viewport.offsetWidth * 0.12);
    if (dx < -threshold) next();
    else if (dx > threshold) prev();
    else goTo(pos);
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('click', (e) => {
    if (suppressClick) {
      e.preventDefault();
      suppressClick = false;
    }
  }, true);

  window.addEventListener('resize', () => setTransform(false));

  setTransform(false);
  updateDots();
  restart();
}

function initHomePage() {
  initCarousel($('[data-carousel]'));
  renderGrid($('#featured-grid'), FEATURED_IDS.map(productById));
  renderGrid($('#deals-grid'), DEAL_IDS.map(productById));
}

/* ---------- 8.2 Catalog (produse.html) ---------- */
function initCatalogPage() {
  CATEGORIES.forEach((c) => {
    renderGrid($(`[data-category-grid="${c.id}"]`), productsInCategory(c.id));
  });

  const input = $('#catalog-filter');
  const clearBtn = $('#catalog-filter-clear');
  const summary = $('#catalog-summary');
  const empty = $('#catalog-empty');
  const pills = $$('.catalog-pill');

  window.applyCatalogFilter = (rawQuery, scrollToResults = false) => {
    const query = String(rawQuery || '');
    if (input.value !== query) input.value = query;
    clearBtn.hidden = !query;
    const trimmed = query.trim();
    const matches = trimmed ? new Set(searchProducts(trimmed).map((p) => p.id)) : null;
    let visibleTotal = 0;

    CATEGORIES.forEach((c) => {
      const section = $(`#${c.id}`);
      let visible = 0;
      $$('.product-card', section).forEach((card) => {
        const show = !matches || matches.has(card.dataset.product);
        card.hidden = !show;
        if (show) visible++;
      });
      section.hidden = visible === 0;
      $('[data-category-count]', section).textContent = visible === 1 ? '1 produs' : `${visible} produse`;
      const pill = pills.find((p) => p.dataset.target === c.id);
      if (pill) {
        pill.classList.toggle('is-disabled', visible === 0);
        $('.catalog-pill__count', pill).textContent = visible;
      }
      visibleTotal += visible;
    });

    empty.hidden = visibleTotal > 0;
    if (trimmed) {
      summary.innerHTML = `<strong>${visibleTotal}</strong> ${visibleTotal === 1 ? 'produs găsit' : 'produse găsite'} pentru „${escapeHTML(trimmed)}”
        <button type="button" class="link-btn" data-clear-filter>Afișează toate produsele</button>`;
      summary.hidden = false;
    } else {
      summary.hidden = true;
    }
    $$('[data-empty-query]').forEach((el) => (el.textContent = trimmed));

    try {
      const url = new URL(window.location.href);
      if (trimmed) url.searchParams.set('q', trimmed);
      else url.searchParams.delete('q');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) {
      /* unele browsere nu permit asta pentru fișiere deschise local (file://) — nu e o problemă */
    }

    if (scrollToResults) $('.catalog-toolbar').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  input.addEventListener('input', () => window.applyCatalogFilter(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) window.applyCatalogFilter('');
  });
  $('.catalog-filter').addEventListener('submit', (e) => e.preventDefault());
  clearBtn.addEventListener('click', () => {
    window.applyCatalogFilter('');
    input.focus();
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear-filter]')) window.applyCatalogFilter('');
  });

  // Pastilele de categorie: dacă secțiunea e ascunsă de filtru, resetăm filtrul
  pills.forEach((pill) =>
    pill.addEventListener('click', () => {
      if ($(`#${pill.dataset.target}`).hidden) window.applyCatalogFilter('');
    })
  );

  // Evidențiază categoria vizibilă în bara de pastile
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          pills.forEach((p) => p.classList.toggle('is-active', p.dataset.target === entry.target.id));
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    CATEGORIES.forEach((c) => observer.observe($(`#${c.id}`)));
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  window.applyCatalogFilter(initialQuery);
  if (initialQuery) {
    const headerInput = $('#site-search');
    if (headerInput) headerInput.value = initialQuery;
  }

  // Grilele sunt randate din JS, deci facem noi scroll la ancora (#laptopuri etc.)
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash && categoryById(hash)) {
    if ($(`#${hash}`).hidden) window.applyCatalogFilter('');
    $(`#${hash}`).scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}

/* ---------- 8.3 Pagina de produs (produs.html?id=...) ---------- */
function qtyStepperMarkup(id, value, label) {
  return `
  <div class="qty-stepper">
    <button class="qty-stepper__btn" type="button" data-step="-1" aria-label="Scade cantitatea">${icon('minus')}</button>
    <input class="qty-stepper__input" id="${id}" type="number" inputmode="numeric" min="1" max="${CONFIG.maxQty}" value="${value}" aria-label="${label}">
    <button class="qty-stepper__btn" type="button" data-step="1" aria-label="Crește cantitatea">${icon('plus')}</button>
  </div>`;
}

/* Butoanele − / + ale unui selector de cantitate; onChange primește noua valoare */
function bindQtyStepper(stepper, onChange = () => {}) {
  const input = $('.qty-stepper__input', stepper);
  const [dec, inc] = $$('.qty-stepper__btn', stepper);
  const clamp = (v) => Math.max(1, Math.min(CONFIG.maxQty, parseInt(v, 10) || 1));
  const refresh = () => {
    dec.disabled = clamp(input.value) <= 1;
    inc.disabled = clamp(input.value) >= CONFIG.maxQty;
  };
  const set = (v) => {
    const val = clamp(v);
    input.value = val;
    refresh();
    onChange(val);
  };
  dec.addEventListener('click', () => set(clamp(input.value) - 1));
  inc.addEventListener('click', () => set(clamp(input.value) + 1));
  input.addEventListener('change', () => set(input.value));
  refresh();
}

function initProductPage() {
  const root = $('#product-root');
  const id = new URLSearchParams(window.location.search).get('id');
  const p = productById(id);

  if (!p) {
    document.title = 'Produs negăsit | MKTech';
    root.innerHTML = emptyStateMarkup({
      iconName: 'search',
      title: 'Produsul nu a fost găsit',
      text: 'Link-ul poate fi greșit sau produsul nu mai există. Caută-l în catalogul nostru.',
      actionHref: 'produse.html',
      actionLabel: 'Mergi la catalog',
      tag: 'h1',
    });
    return;
  }

  const cat = categoryById(p.category);
  const images = productImages(p);
  const discount = discountPercent(p);
  document.title = `${productName(p)} | MKTech`;
  const metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', truncate(productDescription(p), 155));

  const related = productsInCategory(p.category).filter((x) => x.id !== p.id).slice(0, 3);

  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="index.html">Acasă</a></li>
        <li><a href="produse.html#${cat.id}">${categoryName(cat)}</a></li>
        <li aria-current="page">${escapeHTML(productName(p))}</li>
      </ol>
    </nav>

    <div class="product-layout">
      <div class="gallery">
        <div class="gallery__main">
          <img class="gallery__main-img" id="gallery-main" src="${images[0]}" alt="${escapeHTML(productName(p))} — imaginea 1" onerror="imgFallback(this)">
          ${discount ? `<span class="discount-badge discount-badge--lg">-${discount}%</span>` : ''}
          <button class="gallery__nav gallery__nav--prev" type="button" aria-label="Imaginea anterioară">${icon('chevronLeft')}</button>
          <button class="gallery__nav gallery__nav--next" type="button" aria-label="Imaginea următoare">${icon('chevronRight')}</button>
          <span class="gallery__counter" aria-live="polite">1 / ${images.length}</span>
        </div>
        <div class="gallery__thumbs" role="group" aria-label="Alte imagini ale produsului"></div>
      </div>

      <div class="product-info">
        <a class="product-info__cat" href="produse.html#${cat.id}">${icon(cat.icon)} ${categoryName(cat)}</a>
        <h1 class="product-info__title">${escapeHTML(productName(p))}</h1>
        <p class="product-info__code">Cod produs: <span>${escapeHTML(p.cod || p.id.toUpperCase())}</span></p>

        <div class="product-info__price">
          ${priceMarkup(p, 'price--lg')}
          ${p.oldPrice ? `<p class="product-info__save">${icon('tag')} Economisești ${formatPrice(p.oldPrice - p.price)} (-${discount}%)</p>` : ''}
        </div>

        <p class="product-info__desc">${escapeHTML(productDescription(p))}</p>

        <div class="purchase">
          ${qtyStepperMarkup('product-qty', 1, 'Cantitate')}
          <button class="btn btn--primary btn--lg purchase__add" type="button" data-add-to-cart="${p.id}" data-qty-from="#product-qty">
            ${icon('cart')}<span class="btn__label">Adaugă în coș</span>
          </button>
          <button class="fav-btn fav-btn--wide${Favorites.has(p.id) ? ' is-active' : ''}" type="button" data-fav="${p.id}"
            aria-pressed="${Favorites.has(p.id)}" aria-label="${Favorites.has(p.id) ? 'Elimină de la favorite' : 'Adaugă la favorite'}: ${escapeHTML(productName(p))}">
            ${icon('heart')}<span class="fav-btn__text">${Favorites.has(p.id) ? 'În favorite' : 'Favorite'}</span>
          </button>
        </div>

        <ul class="perks">
          <li>${icon('truck')}<span>Livrare rapidă</span></li>
          <li>${icon('shield')}<span>Garanție inclusă</span></li>
          <li>${icon('lock')}<span>Plată securizată</span></li>
        </ul>
      </div>
    </div>

    <section class="spec-section" aria-labelledby="spec-title">
      <h2 class="section-title" id="spec-title">Specificații tehnice</h2>
      <dl class="spec-table">
        ${p.specs
          .map(
            ([k, v]) =>
              `<div class="spec-table__row"><dt>${escapeHTML(translateString(k) || k)}</dt><dd>${escapeHTML(translateString(v) || v)}</dd></div>`
          )
          .join('')}
      </dl>
    </section>

    ${
      related.length
        ? `<section class="section related" aria-labelledby="related-title">
            <div class="section-head">
              <h2 class="section-title" id="related-title">Alte produse din ${categoryName(cat).toLowerCase()}</h2>
              <a class="section-head__link" href="produse.html#${cat.id}">Vezi categoria ${icon('arrowRight')}</a>
            </div>
            <div class="product-grid" id="related-grid"></div>
          </section>`
        : ''
    }`;

  renderGrid($('#related-grid'), related);
  bindQtyStepper($('.purchase .qty-stepper', root));

  // Galerie: imagine mare + 3 miniaturi (celelalte 3 poze). Click pe miniatură → devine imaginea mare.
  const mainImg = $('#gallery-main');
  const thumbsWrap = $('.gallery__thumbs', root);
  const counter = $('.gallery__counter', root);
  let current = 0;

  const showImage = (index) => {
    current = (index + images.length) % images.length;
    mainImg.classList.add('is-changing');
    const swap = () => {
      mainImg.classList.remove('is-placeholder');
      mainImg.onerror = () => imgFallback(mainImg);
      mainImg.src = images[current];
      mainImg.alt = `${productName(p)} — imaginea ${current + 1}`;
      counter.textContent = `${current + 1} / ${images.length}`;
      requestAnimationFrame(() => mainImg.classList.remove('is-changing'));
    };
    prefersReducedMotion() ? swap() : setTimeout(swap, 120);
    renderThumbs();
  };

  function renderThumbs() {
    thumbsWrap.innerHTML = images
      .map((src, i) => (i === current ? '' : `
        <button class="gallery__thumb" type="button" data-index="${i}" aria-label="Arată imaginea ${i + 1}">
          <img src="${src}" alt="" loading="lazy" onerror="imgFallback(this)">
        </button>`))
      .join('');
  }

  thumbsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.gallery__thumb');
    if (!btn) return;
    showImage(Number(btn.dataset.index));
    const nextThumb = $('.gallery__thumb', thumbsWrap);
    if (nextThumb) nextThumb.focus({ preventScroll: true });
  });
  $('.gallery__nav--prev', root).addEventListener('click', () => showImage(current - 1));
  $('.gallery__nav--next', root).addEventListener('click', () => showImage(current + 1));
  renderThumbs();

  // pre-încarcă restul imaginilor ca schimbarea să fie instantanee
  images.slice(1).forEach((src) => {
    const im = new Image();
    im.src = src;
  });
}

/* ---------- 8.4 Coș (cos.html) ---------- */
function initCartPage() {
  /* așteptăm să fie încărcat și comanda-core.js (se include după script.js) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCartPage, { once: true });
  } else {
    startCartPage();
  }
}

function startCartPage() {
  const root = $('#cart-root');

  const lineMarkup = (item) => {
    const p = productById(item.id);
    const cat = categoryById(p.category);
    const url = `produs.html?id=${p.id}`;
    return `
    <li class="cart-line" data-line="${p.id}">
      <a class="cart-line__media" href="${url}" tabindex="-1" aria-hidden="true">
        <img src="${productImages(p)[0]}" alt="" loading="lazy" onerror="imgFallback(this)">
      </a>
      <div class="cart-line__info">
        <span class="cart-line__cat">${categoryName(cat, true)}</span>
        <a class="cart-line__name" href="${url}">${escapeHTML(productName(p))}</a>
        <div class="cart-line__unit">
          ${p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : ''}
          <span>${formatPrice(p.price)}</span><small>/ buc.</small>
        </div>
      </div>
      <div class="cart-line__qty">
        ${qtyStepperMarkup(`qty-${p.id}`, item.qty, `Cantitate pentru ${escapeHTML(productName(p))}`)}
      </div>
      <div class="cart-line__subtotal">
        <span class="cart-line__subtotal-label">Subtotal</span>
        <strong data-line-subtotal>${formatPrice(p.price * item.qty)}</strong>
      </div>
      <button class="icon-btn cart-line__remove" type="button" data-remove-line="${p.id}" aria-label="Șterge din coș: ${escapeHTML(productName(p))}" title="Șterge din coș">
        ${icon('trash')}
      </button>
    </li>`;
  };

  const transportPentru = (subtotal) =>
    window.MKComanda ? window.MKComanda.transportPentru(subtotal) : subtotal === 0 || subtotal > 300 ? 0 : 15;

  const updateSummary = () => {
    const { total, savings, count } = Cart.totals();
    const transport = transportPentru(total);
    $('[data-summary-count]', root).textContent = `${count} buc.`;
    $('[data-summary-products]', root).textContent = formatPrice(total + savings);
    const savingsRow = $('[data-summary-savings-row]', root);
    savingsRow.hidden = savings === 0;
    $('[data-summary-savings]', root).textContent = `-${formatPrice(savings)}`;
    $('[data-summary-subtotal]', root).textContent = formatPrice(total);
    $('[data-summary-transport]', root).textContent = transport === 0 ? 'Gratuit' : formatPrice(transport);
    $('[data-summary-total]', root).textContent = formatPrice(total + transport);
    $('[data-cart-heading-count]', root).textContent = `(${count})`;
    const buton = $('[data-checkout]', root);
    if (buton) buton.disabled = count === 0;
  };

  const render = () => {
    const items = Cart.items();
    if (!items.length) {
      root.innerHTML = `
        <div class="page-head"><h1 class="page-title">Coșul tău</h1></div>
        ${emptyStateMarkup({
          iconName: 'cart',
          title: 'Coșul tău este gol',
          text: 'Adaugă produse din catalog și le vei găsi aici. Coșul rămâne salvat chiar dacă închizi browserul.',
          actionHref: 'produse.html',
          actionLabel: 'Descoperă produsele',
        })}
        <section class="section" aria-labelledby="cart-suggest-title">
          <div class="section-head"><h2 class="section-title" id="cart-suggest-title">Produse recomandate</h2></div>
          <div class="product-grid" id="cart-suggest-grid"></div>
        </section>`;
      renderGrid($('#cart-suggest-grid'), FEATURED_IDS.slice(0, 3).map(productById));
      return;
    }

    root.innerHTML = `
      <div class="page-head page-head--row">
        <h1 class="page-title">Coșul tău <span class="page-title__count" data-cart-heading-count></span></h1>
        <button class="link-btn link-btn--danger" type="button" data-clear-cart>${icon('trash')} Golește coșul</button>
      </div>

      <div class="cart-layout">
        <div class="cart-main">
          <ul class="cart-list" aria-label="Produse în coș">${items.map(lineMarkup).join('')}</ul>

          <!-- Datele de livrare: aceleași câmpuri și aceleași validări
               ca la formularul de comandă de pe contact.html -->
          <section class="checkout-card" aria-labelledby="checkout-title">
            <h2 class="checkout-card__title" id="checkout-title">Date de livrare</h2>

            <form class="checkout-form" id="checkout-form" novalidate>
              <div class="checkout-grid">
                <div class="field">
                  <label class="field__label" for="cart-nume">Nume și prenume / Denumire firmă *</label>
                  <input class="input" id="cart-nume" type="text" autocomplete="name">
                  <p class="field__error" aria-live="polite"></p>
                </div>
                <div class="field">
                  <label class="field__label" for="cart-email">Email *</label>
                  <input class="input" id="cart-email" type="email" autocomplete="email">
                  <p class="field__error" aria-live="polite"></p>
                </div>
                <div class="field">
                  <label class="field__label" for="cart-telefon">Telefon *</label>
                  <input class="input" id="cart-telefon" type="tel" autocomplete="tel">
                  <p class="field__error" aria-live="polite"></p>
                </div>
                <div class="field">
                  <label class="field__label" for="cart-adresa">Adresă de livrare *</label>
                  <input class="input" id="cart-adresa" type="text" autocomplete="street-address">
                  <p class="field__error" aria-live="polite"></p>
                </div>
                <div class="field checkout-grid__wide">
                  <label class="field__label" for="cart-obs">Observații (opțional)</label>
                  <textarea class="input" id="cart-obs" rows="3" maxlength="500"></textarea>
                </div>
              </div>

              <div class="field checkout-check">
                <label class="checkout-check__label">
                  <input type="checkbox" id="cart-gdpr">
                  <span>Sunt de acord cu prelucrarea datelor pentru procesarea comenzii.</span>
                </label>
                <p class="field__error" aria-live="polite"></p>
              </div>

              <!-- câmp anti-spam: oamenii nu îl văd, roboții îl completează -->
              <input class="honeypot" type="text" id="cart-website" tabindex="-1" autocomplete="off" aria-hidden="true">
            </form>
          </section>
        </div>

        <aside class="summary-card" aria-labelledby="summary-title">
          <h2 class="summary-card__title" id="summary-title">Sumar comandă</h2>
          <dl class="summary-card__rows">
            <div><dt><span>Produse</span> (<span data-summary-count></span>)</dt><dd data-summary-products></dd></div>
            <div class="summary-card__savings" data-summary-savings-row><dt>Reduceri</dt><dd data-summary-savings></dd></div>
            <div><dt>Subtotal</dt><dd data-summary-subtotal></dd></div>
            <div><dt>Transport</dt><dd data-summary-transport></dd></div>
            <div class="summary-card__total"><dt>Total</dt><dd data-summary-total></dd></div>
          </dl>
          <ul class="checkout-info">
            <li>${icon('truck')}<span>Cost transport: 15 lei (gratuit pentru comenzi peste 300 lei).</span></li>
            <li>${icon('clock')}<span>Termen de livrare: 2–5 zile lucrătoare.</span></li>
            <li>${icon('lock')}<span>Plata: ramburs la livrare sau ordin de plată.</span></li>
          </ul>
          <button class="btn btn--primary btn--lg btn--block" type="button" data-checkout>${icon('check')}<span class="btn__label">Plasează comanda</span></button>
          <p class="checkout-status" data-checkout-status role="status"></p>
          <a class="summary-card__continue" href="produse.html">${icon('chevronLeft')} Continuă cumpărăturile</a>
        </aside>
      </div>`;

    $$('.cart-line', root).forEach((line) => {
      const id = line.dataset.line;
      bindQtyStepper($('.qty-stepper', line), (qty) => {
        Cart.setQty(id, qty);
        $('[data-line-subtotal]', line).textContent = formatPrice(productById(id).price * qty);
        updateSummary();
      });
    });
    updateSummary();
  };

  root.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-line]');
    if (removeBtn) {
      const id = removeBtn.dataset.removeLine;
      const line = removeBtn.closest('.cart-line');
      line.classList.add('is-removing');
      setTimeout(() => {
        Cart.remove(id);
        render();
        showToast({ type: 'info', title: 'Produs eliminat din coș', message: productName(productById(id)) });
      }, prefersReducedMotion() ? 0 : 220);
      return;
    }

    if (e.target.closest('[data-clear-cart]')) {
      const confirmText = 'Sigur vrei să golești coșul?';
      if (window.confirm(translateString(confirmText) || confirmText)) {
        Cart.clear();
        render();
      }
      return;
    }

    if (e.target.closest('[data-checkout]')) {
      trimiteComanda();
    }
  });

  /* ---------- trimiterea comenzii (Supabase + emailuri, prin comanda-core.js) ---------- */
  const eroareCamp = (id, mesaj) => {
    const camp = $(`#${id}`, root).closest('.field');
    camp.classList.toggle('has-error', !!mesaj);
    $('.field__error', camp).textContent = mesaj || '';
    return !mesaj;
  };

  const spuneStatus = (mesaj, eroare = true) => {
    const el = $('[data-checkout-status]', root);
    if (!el) return;
    el.textContent = mesaj;
    el.classList.toggle('is-error', eroare);
  };

  async function trimiteComanda() {
    const core = window.MKComanda;
    const buton = $('[data-checkout]', root);
    if (!core) return;
    if ($('#cart-website', root).value) return; // robot
    if (!Cart.count()) return;

    if (!core.configurat()) {
      spuneStatus('Comenzile nu pot fi trimise momentan. Încearcă din nou mai târziu.');
      return;
    }

    const valori = {
      nume: $('#cart-nume', root).value,
      email: $('#cart-email', root).value,
      telefon: $('#cart-telefon', root).value,
      adresa: $('#cart-adresa', root).value,
      acord: $('#cart-gdpr', root).checked,
    };
    const erori = core.valideazaClient(valori);
    let ok = true;
    ok = eroareCamp('cart-nume', erori.nume) && ok;
    ok = eroareCamp('cart-email', erori.email) && ok;
    ok = eroareCamp('cart-telefon', erori.telefon) && ok;
    ok = eroareCamp('cart-adresa', erori.adresa) && ok;
    ok = eroareCamp('cart-gdpr', erori.acord) && ok;
    if (!ok) {
      spuneStatus('Verifică datele de livrare.');
      return;
    }

    const produse = Cart.items().map((item) => {
      const p = productById(item.id);
      return {
        id: p.id,
        cod: p.cod,
        denumire: productName(p),
        um: 'buc.',
        cantitate: item.qty,
        pret: p.price,
        valoare: p.price * item.qty,
      };
    });

    spuneStatus('', false);
    buton.disabled = true;
    buton.classList.add('is-loading');

    const rezultat = await core.plaseazaComanda({
      produse,
      client: { ...valori, observatii: $('#cart-obs', root).value.trim() },
      sursa: '(comandă din coș)',
    });

    buton.disabled = false;
    buton.classList.remove('is-loading');

    if (rezultat.status === 'prea-devreme') {
      spuneStatus('Ai trimis deja o comandă. Mai așteaptă 30 de secunde înainte de următoarea.');
      return;
    }
    if (rezultat.status !== 'ok') {
      spuneStatus('Comanda nu a putut fi trimisă. Verifică conexiunea la internet și încearcă din nou.');
      return;
    }

    const { total, count } = Cart.totals();
    const transport = transportPentru(total);
    Cart.clear(); // comanda a fost salvată, golim coșul
    arataComandaTrimisa(rezultat, count, total + transport);
  }

  function arataComandaTrimisa(rezultat, bucati, total) {
    const user = Auth.current();
    root.innerHTML = `
      <div class="order-success" role="status">
        <span class="order-success__icon">${icon('check')}</span>
        <h1 class="order-success__title">Comanda ${escapeHTML(rezultat.nr_comanda)} a fost înregistrată.</h1>
        <p class="order-success__text">${user ? `Mulțumim, ${escapeHTML(user.name.split(' ')[0])}! ` : 'Mulțumim! '}${
          rezultat.emailTrimis ? 'Ți-am trimis confirmarea pe email.' : 'Comanda a ajuns la noi.'
        }</p>
        <dl class="order-success__details">
          <div><dt>Număr comandă</dt><dd>${escapeHTML(rezultat.nr_comanda)}</dd></div>
          <div><dt>Produse</dt><dd>${bucati}</dd></div>
          <div><dt>Total</dt><dd>${formatPrice(total)}</dd></div>
        </dl>
        ${
          rezultat.emailTrimis
            ? ''
            : `<p class="order-success__email">${icon('mail')}<span>Emailul de confirmare nu a putut fi trimis.</span></p>`
        }
        <p class="order-success__text">Termen de livrare: 2–5 zile lucrătoare. Plata: ramburs la livrare sau ordin de plată.</p>
        <a class="btn btn--primary btn--lg" href="produse.html">Înapoi la produse ${icon('arrowRight')}</a>
      </div>`;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  // re-randare dacă coșul se schimbă din alt loc (alt tab sau butoane de pe recomandări)
  document.addEventListener('cart:external', render);
  document.addEventListener('cart:change', () => {
    if (!$('.cart-list', root) && !$('.order-success', root) && Cart.count() > 0) render();
  });

  render();
}

/* ---------- 8.5 Favorite (favorite.html) ---------- */
function initFavoritesPage() {
  const root = $('#favorites-root');

  const render = () => {
    const products = Favorites.ids().map(productById);
    if (!products.length) {
      root.innerHTML = `
        <div class="page-head"><h1 class="page-title">Produse favorite</h1></div>
        ${emptyStateMarkup({
          iconName: 'heart',
          title: 'Nu ai încă produse favorite',
          text: 'Apasă pe inimioara de pe orice produs ca să îl salvezi aici pentru mai târziu.',
          actionHref: 'produse.html',
          actionLabel: 'Explorează catalogul',
        })}`;
      return;
    }

    root.innerHTML = `
      <div class="page-head page-head--row">
        <div>
          <h1 class="page-title">Produse favorite <span class="page-title__count">(${products.length})</span></h1>
          <p class="page-subtitle">Produsele salvate rămân aici și după ce închizi browserul.</p>
        </div>
        <button class="btn btn--outline" type="button" data-add-all>${icon('cart')} Adaugă toate în coș</button>
      </div>
      <div class="product-grid" id="favorites-grid"></div>`;
    renderGrid($('#favorites-grid'), products, { variant: 'favorite' });
  };

  root.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-fav-remove]');
    if (removeBtn) {
      const id = removeBtn.dataset.favRemove;
      Favorites.remove(id);
      showToast({ type: 'fav', title: 'Eliminat de la favorite', message: productName(productById(id)) });
      return;
    }
    if (e.target.closest('[data-add-all]')) {
      const ids = Favorites.ids();
      ids.forEach((id) => Cart.add(id, 1));
      bumpBadge('[data-cart-count]');
      showToast({
        title: 'Produse adăugate în coș',
        message: ids.length === 1 ? '1 produs' : `${ids.length} produse`,
        action: { href: 'cos.html', label: 'Vezi coșul' },
      });
    }
  });

  document.addEventListener('favorites:change', render);
  document.addEventListener('favorites:external', render);
  render();
}

/* ---------- 8.6 Cont (cont.html) ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Afișează / șterge mesajul de eroare de sub un câmp */
function setFieldError(input, message) {
  const field = input.closest('.field');
  const error = field && $('.field__error', field);
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (field) field.classList.toggle('has-error', !!message);
  if (error) error.textContent = message || '';
}

function validateFields(rules) {
  let firstInvalid = null;
  rules.forEach(({ input, check }) => {
    const message = check(input.value);
    setFieldError(input, message);
    if (message && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function bindPasswordToggles(root) {
  $$('[data-toggle-password]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = $(`#${btn.dataset.togglePassword}`);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = icon(show ? 'eyeOff' : 'eye');
      btn.setAttribute('aria-label', show ? 'Ascunde parola' : 'Arată parola');
      btn.setAttribute('aria-pressed', String(show));
    });
  });
}

function initAccountPage() {
  const root = $('#account-root');

  const demoNotice = `
    <p class="demo-note">${icon('info')}<span><strong>Cont demonstrativ.</strong> Datele se salvează doar în acest browser (localStorage), necriptat —
    nu sunt sincronizate pe alte dispozitive. Nu folosi o parolă pe care o ai la alte conturi.</span></p>`;

  const passwordField = (id, label, autocomplete) => `
    <div class="field">
      <label class="field__label" for="${id}">${label}</label>
      <div class="field__control field__control--password">
        <input class="input" id="${id}" name="password" type="password" autocomplete="${autocomplete}" required minlength="6">
        <button class="field__toggle" type="button" data-toggle-password="${id}" aria-label="Arată parola" aria-pressed="false">${icon('eye')}</button>
      </div>
      <p class="field__error" aria-live="polite"></p>
    </div>`;

  const renderAuth = (mode = 'login') => {
    root.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-intro">
          <span class="eyebrow">Contul meu MKTech</span>
          <h1 class="page-title">Bine ai venit!</h1>
          <p class="page-subtitle">Autentifică-te sau creează un cont nou ca să vezi rapid coșul, favoritele și detaliile tale.</p>
          <ul class="auth-benefits">
            <li>${icon('heart')}<span>Produsele favorite, mereu la îndemână</span></li>
            <li>${icon('cart')}<span>Coșul rămâne salvat între vizite</span></li>
            <li>${icon('user')}<span>Mesaj personalizat la finalizarea comenzii</span></li>
          </ul>
        </div>

        <div class="auth-card">
          <div class="tabs" role="tablist" aria-label="Autentificare sau cont nou">
            <button class="tabs__tab" type="button" role="tab" id="tab-login" aria-controls="panel-login" aria-selected="${mode === 'login'}">Autentificare</button>
            <button class="tabs__tab" type="button" role="tab" id="tab-register" aria-controls="panel-register" aria-selected="${mode === 'register'}">Cont nou</button>
          </div>

          <form class="auth-form" id="panel-login" role="tabpanel" aria-labelledby="tab-login" novalidate ${mode === 'login' ? '' : 'hidden'}>
            <div class="field">
              <label class="field__label" for="login-email">Email</label>
              <input class="input" id="login-email" name="email" type="email" autocomplete="email" required placeholder="nume@exemplu.ro">
              <p class="field__error" aria-live="polite"></p>
            </div>
            ${passwordField('login-password', 'Parolă', 'current-password')}
            <button class="btn btn--primary btn--lg btn--block" type="submit">Intră în cont</button>
            <p class="auth-switch">Nu ai cont? <button type="button" class="link-btn" data-switch="register">Creează unul acum</button></p>
          </form>

          <form class="auth-form" id="panel-register" role="tabpanel" aria-labelledby="tab-register" novalidate ${mode === 'register' ? '' : 'hidden'}>
            <div class="field">
              <label class="field__label" for="register-name">Nume</label>
              <input class="input" id="register-name" name="name" type="text" autocomplete="name" required placeholder="Prenume Nume">
              <p class="field__error" aria-live="polite"></p>
            </div>
            <div class="field">
              <label class="field__label" for="register-email">Email</label>
              <input class="input" id="register-email" name="email" type="email" autocomplete="email" required placeholder="nume@exemplu.ro">
              <p class="field__error" aria-live="polite"></p>
            </div>
            ${passwordField('register-password', 'Parolă (minimum 6 caractere)', 'new-password')}
            <button class="btn btn--primary btn--lg btn--block" type="submit">Creează contul</button>
            <p class="auth-switch">Ai deja cont? <button type="button" class="link-btn" data-switch="login">Autentifică-te</button></p>
          </form>

          ${demoNotice}
        </div>
      </div>`;

    const loginForm = $('#panel-login');
    const registerForm = $('#panel-register');
    const tabs = $$('.tabs__tab', root);

    const switchTo = (next) => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.id === `tab-${next}`)));
      loginForm.hidden = next !== 'login';
      registerForm.hidden = next !== 'register';
      $('input', next === 'login' ? loginForm : registerForm).focus();
    };
    $('#tab-login').addEventListener('click', () => switchTo('login'));
    $('#tab-register').addEventListener('click', () => switchTo('register'));
    $$('[data-switch]', root).forEach((b) => b.addEventListener('click', () => switchTo(b.dataset.switch)));
    $('.tabs', root).addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = loginForm.hidden ? 'login' : 'register';
      switchTo(next);
      $(`#tab-${next}`).focus();
    });
    bindPasswordToggles(root);

    // curăță eroarea când utilizatorul corectează câmpul
    $$('.input', root).forEach((input) => input.addEventListener('input', () => setFieldError(input, '')));

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#login-email');
      const password = $('#login-password');
      const valid = validateFields([
        { input: email, check: (v) => (!v.trim() ? 'Introdu adresa de email.' : !EMAIL_RE.test(v.trim()) ? 'Adresa de email nu este validă.' : '') },
        { input: password, check: (v) => (!v ? 'Introdu parola.' : '') },
      ]);
      if (!valid) return;
      const result = Auth.login(email.value, password.value);
      if (!result.ok) {
        const target = result.field === 'password' ? password : email;
        setFieldError(target, result.message);
        target.focus();
        return;
      }
      showToast({ title: `Salut, ${result.user.name.split(' ')[0]}!`, message: 'Te-ai autentificat cu succes.' });
      renderDashboard();
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#register-name');
      const email = $('#register-email');
      const password = $('#register-password');
      const valid = validateFields([
        { input: name, check: (v) => (v.trim().length < 2 ? 'Introdu numele tău (minimum 2 caractere).' : '') },
        { input: email, check: (v) => (!v.trim() ? 'Introdu adresa de email.' : !EMAIL_RE.test(v.trim()) ? 'Adresa de email nu este validă.' : '') },
        { input: password, check: (v) => (v.length < 6 ? 'Parola trebuie să aibă cel puțin 6 caractere.' : '') },
      ]);
      if (!valid) return;
      const result = Auth.register({ name: name.value, email: email.value, password: password.value });
      if (!result.ok) {
        setFieldError(email, result.message);
        email.focus();
        return;
      }
      showToast({ title: 'Cont creat', message: `Bine ai venit, ${result.user.name.split(' ')[0]}!` });
      renderDashboard();
    });
  };

  const renderDashboard = () => {
    const user = Auth.current();
    if (!user) {
      renderAuth();
      return;
    }
    const firstName = user.name.split(' ')[0];
    const locales = { ro: 'ro-RO', en: 'en-GB', es: 'es-ES', de: 'de-DE' };
    const since = new Date(user.createdAt).toLocaleDateString(locales[CURRENT_LANG] || 'ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const cartCount = Cart.count();
    const favCount = Favorites.ids().length;

    root.innerHTML = `
      <div class="account">
        <div class="account-hero">
          <span class="account-hero__avatar" aria-hidden="true">${escapeHTML(user.name.trim().charAt(0).toUpperCase())}</span>
          <div>
            <h1 class="page-title">Salut, ${escapeHTML(firstName)}!</h1>
            <p class="page-subtitle">Ești autentificat în contul tău MKTech.</p>
          </div>
          <button class="btn btn--outline account-hero__logout" type="button" data-logout>${icon('logout')} Deconectare</button>
        </div>

        <div class="account-grid">
          <section class="account-card" aria-labelledby="acc-details">
            <h2 class="account-card__title" id="acc-details">Detaliile contului</h2>
            <dl class="account-details">
              <div><dt>Nume</dt><dd>${escapeHTML(user.name)}</dd></div>
              <div><dt>Email</dt><dd>${escapeHTML(user.email)}</dd></div>
              <div><dt>Cont creat</dt><dd>${since}</dd></div>
            </dl>
          </section>

          <a class="account-card account-card--link" href="cos.html">
            <span class="account-card__icon">${icon('cart')}</span>
            <span class="account-card__stat">${cartCount}</span>
            <span class="account-card__label">${cartCount === 1 ? 'produs în coș' : 'produse în coș'}</span>
            <span class="account-card__cta">Vezi coșul ${icon('arrowRight')}</span>
          </a>

          <a class="account-card account-card--link" href="favorite.html">
            <span class="account-card__icon account-card__icon--accent">${icon('heart')}</span>
            <span class="account-card__stat">${favCount}</span>
            <span class="account-card__label">${favCount === 1 ? 'produs favorit' : 'produse favorite'}</span>
            <span class="account-card__cta">Vezi favoritele ${icon('arrowRight')}</span>
          </a>
        </div>

        ${demoNotice}
      </div>`;

    $('[data-logout]', root).addEventListener('click', () => {
      Auth.logout();
      showToast({ type: 'info', title: 'Te-ai deconectat', message: 'Te așteptăm înapoi!' });
      renderAuth();
    });
  };

  renderDashboard();
}

/* ---------- 8.7 Contact (contact.html) ----------
   ⚠️ Formularul NU poate trimite emailuri singur (site static, fără server).
   - Dacă CONFIG.contactFormEndpoint e gol (''), mesajul NU se trimite nicăieri:
     doar se validează câmpurile și se afișează un mesaj de succes SIMULAT.
   - Dacă lipești acolo endpoint-ul Formspree (vezi CONFIG, sus în fișier),
     mesajele se trimit real, prin fetch, către Formspree → ajung pe emailul tău. */
function initContactPage() {
  const form = $('#contact-form');
  if (!form) return;
  const success = $('#contact-success');
  const submitBtn = $('[type="submit"]', form);
  const name = $('#contact-name');
  const email = $('#contact-email');
  const message = $('#contact-message');
  const counter = $('#contact-message-count');
  const isLive = Boolean(CONFIG.contactFormEndpoint);

  $$('[data-contact-mode]').forEach((el) => (el.hidden = el.dataset.contactMode !== (isLive ? 'live' : 'demo')));

  [name, email, message].forEach((input) => input.addEventListener('input', () => setFieldError(input, '')));
  if (counter) {
    const updateCount = () => (counter.textContent = `${message.value.length} / ${message.maxLength}`);
    message.addEventListener('input', updateCount);
    updateCount();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valid = validateFields([
      { input: name, check: (v) => (v.trim().length < 2 ? 'Introdu numele tău.' : '') },
      { input: email, check: (v) => (!v.trim() ? 'Introdu adresa de email.' : !EMAIL_RE.test(v.trim()) ? 'Adresa de email nu este validă.' : '') },
      { input: message, check: (v) => (v.trim().length < 10 ? 'Mesajul trebuie să aibă cel puțin 10 caractere.' : '') },
    ]);
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    try {
      if (isLive) {
        const response = await fetch(CONFIG.contactFormEndpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600)); // simulare trimitere
      }
      $('[data-success-name]', success).textContent = name.value.trim().split(' ')[0];
      form.hidden = true;
      success.hidden = false;
      success.focus();
      form.reset();
    } catch (err) {
      showToast({ type: 'info', title: 'Mesajul nu a putut fi trimis', message: 'Verifică conexiunea la internet și încearcă din nou.', duration: 5000 });
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  });

  $('[data-contact-again]', success).addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    if (counter) counter.textContent = `0 / ${message.maxLength}`;
    name.focus();
  });
}

/* ---------- 8.8 Organigrama (secțiune în despre.html) ----------
   ATENȚIE: organigrama este acum o IMAGINE pusă direct în despre.html
   (imagini/organigrama.png), deci codul de mai jos nu mai desenează nimic.
   L-am păstrat (împreună cu datele din ORGANIGRAMA) pentru cazul în care
   vrei să revii la varianta desenată din cod: e de ajuns să pui înapoi
   <div id="org-chart"></div> în despre.html, în locul imaginii. */
function initAboutPage() {
  const root = $('#org-chart');
  if (!root) return;

  const people = (membri) => `<ul class="org-people">${membri.map((m) => `<li>${fillText(m)}</li>`).join('')}</ul>`;

  /* un birou: cutia lui + (dacă are) birourile din subordinea lui, legate cu linie */
  const officeCard = (birou, sub = false) => `
    <article class="org-office${sub ? ' org-office--sub' : ''}">
      <h3 class="org-office__title">${escapeHTML(birou.titlu)}</h3>
      ${birou.detaliu ? `<p class="org-office__detail">${escapeHTML(birou.detaliu)}</p>` : ''}
      ${people(birou.membri)}
    </article>`;

  const officeGroup = (birou) => `
    <div class="org-office-group">
      ${officeCard(birou)}
      ${
        birou.subordonate && birou.subordonate.length
          ? `<div class="org-suboffices">${birou.subordonate.map((sub) => officeCard(sub, true)).join('')}</div>`
          : ''
      }
    </div>`;

  /* nivelurile de conducere: AGA → CA → MG */
  const leadership = ORGANIGRAMA.conducere
    .map(
      (nivel) => `
      <article class="org-box org-box--lead">
        <span class="org-box__role">${escapeHTML(nivel.rol)}</span>
        ${nivel.detaliu ? `<span class="org-box__detail">${escapeHTML(nivel.detaliu)}</span>` : ''}
        ${people(nivel.membri)}
      </article>`
    )
    .join('');

  /* cele trei direcții, fiecare cu birourile ei */
  const branches = ORGANIGRAMA.departamente
    .map(
      (dep) => `
      <div class="org-chart__branch">
        <article class="org-box org-box--manager">
          ${dep.icon ? `<span class="org-box__icon">${icon(dep.icon)}</span>` : ''}
          <span class="org-box__role">${escapeHTML(dep.rol)}</span>
          <span class="org-box__name">${fillText(dep.nume)}</span>
        </article>
        ${
          dep.birouri && dep.birouri.length
            ? `<div class="org-offices">${dep.birouri.map(officeGroup).join('')}</div>`
            : ''
        }
      </div>`
    )
    .join('');

  root.innerHTML = `
    <div class="org-chart">
      <p class="org-chart__company">F.E. MK Tech S.R.L.</p>
      <div class="org-chart__lead">${leadership}</div>
      <div class="org-chart__branches">${branches}</div>
    </div>`;
}

/* ---------- 8.8b Reduceri (reduceri.html) ----------
   Afișează doar produsele care au deja preț redus în catalogul PRODUCTS. */
function initDealsPage() {
  const root = $('#deals-root');
  if (!root) return;
  const deals = PRODUCTS.filter((p) => p.oldPrice);

  if (!deals.length) {
    root.innerHTML = `<p class="empty-note">Momentan nu există produse la reducere.</p>`;
    return;
  }

  root.innerHTML = '<div class="product-grid" id="deals-page-grid"></div>';
  renderGrid($('#deals-page-grid'), deals);
}

/* ---------- 8.9 Noutăți (noutati.html) ----------
   Știrile se completează în NOUTATI, sus în acest fișier (secțiunea 1B). */
function initNewsPage() {
  const root = $('#news-root');
  if (!root) return;

  if (!NOUTATI.length) {
    root.innerHTML = emptyStateMarkup({
      iconName: 'news',
      title: 'Nicio noutate deocamdată',
      text: 'Revino curând: aici vom publica noutățile firmei MKTech.',
      actionHref: 'produse.html',
      actionLabel: 'Vezi produsele',
    });
    return;
  }

  /* textul știrii: linkurile se scriu [text](pagina.html) */
  const newsText = (text) =>
    escapeHTML(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

  root.innerHTML = `
    <div class="news-list">
      ${NOUTATI.map(
        (item) => `
        <article class="news-card">
          ${
            item.imagine
              ? `<p class="news-card__media">
                  <span class="news-card__soon">Imagine în curând</span>
                  <img src="${imgPath(item.imagine)}" alt="" loading="lazy" onerror="newsImageFallback(this)">
                </p>`
              : ''
          }
          <div class="news-card__body">
            <p class="news-card__date">${icon('calendar')}<span>${fillText(item.data)}</span></p>
            <h2 class="news-card__title">${fillText(localizedField(item, 'titlu'))}</h2>
            <p class="news-card__text">${newsText(localizedField(item, 'text'))}</p>
          </div>
        </article>`
      ).join('')}
    </div>`;
}

/* ---------- 8.10 Listă de prețuri (lista-preturi.html) ----------
   Se construiește din catalogul PRODUCTS — nu există prețuri scrise a doua oară.
   Pagina are și stiluri de print (@media print în style.css). */
function initPriceListPage() {
  const root = $('#pricelist-root');
  if (!root) return;

  const rows = (catId) =>
    productsInCategory(catId)
      .map(
        (p) => `
        <tr>
          <td class="pricelist-table__name"><a href="produs.html?id=${p.id}">${escapeHTML(productName(p))}</a></td>
          <td class="pricelist-table__code">${escapeHTML(p.cod || p.id.toUpperCase())}</td>
          <td class="pricelist-table__price">
            ${p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : ''}
            <strong${p.oldPrice ? ' class="is-sale"' : ''}>${formatPrice(p.price)}</strong>
          </td>
        </tr>`
      )
      .join('');

  root.innerHTML = `
    <p class="print-head" aria-hidden="true">MKTech — Listă de prețuri · ${escapeHTML(ULTIMA_ACTUALIZARE)}</p>
    ${CATEGORIES.map(
      (c) => `
      <section class="pricelist-cat" id="lista-${c.id}">
        <h2 class="pricelist-cat__title">${icon(c.icon)} ${escapeHTML(categoryName(c))}</h2>
        <div class="table-scroll">
        <table class="pricelist-table">
          <thead>
            <tr><th scope="col">Produs</th><th scope="col">Cod produs</th><th scope="col">Preț</th></tr>
          </thead>
          <tbody>${rows(c.id)}</tbody>
        </table>
        </div>
      </section>`
    ).join('')}`;
}

/* ---------- 8.11 Galerie foto (galerie.html) + lupa pentru imagini ----------
   Pozele sunt imagini/poza1.png … imagini/poza20.png (numărul: CONFIG.galleryCount).
   Pozele care lipsesc apar ca bloc gri „Imagine în curând” și sunt sărite în lupă. */

/* poză lipsă într-o galerie / organigramă → rămâne blocul gri */
function zoomImageFallback(img) {
  const src = img.getAttribute('src') || '';
  if (!img.dataset.altExt && src.endsWith('.png')) {
    img.dataset.altExt = '1';
    img.src = src.replace(/\.png$/, '.jpg');
    return;
  }
  const frame = img.closest('[data-zoom]');
  if (frame) frame.classList.add('is-empty');
  img.remove();
}

/* Lupa (lightbox): o singură fereastră, folosită de toate paginile */
const Lightbox = {
  items: [],
  index: 0,
  el: null,

  build() {
    if (this.el) return;
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="lightbox" hidden role="dialog" aria-modal="true" aria-label="Imagine mărită">
        <button class="lightbox__close" type="button" aria-label="Închide">${icon('close')}</button>
        <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Imaginea anterioară">${icon('chevronLeft')}</button>
        <figure class="lightbox__figure">
          <img class="lightbox__img" src="" alt="">
          <figcaption class="lightbox__counter" aria-live="polite"></figcaption>
        </figure>
        <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Imaginea următoare">${icon('chevronRight')}</button>
      </div>`
    );
    this.el = $('.lightbox');
    $('.lightbox__close', this.el).addEventListener('click', () => this.close());
    $('.lightbox__nav--prev', this.el).addEventListener('click', () => this.show(this.index - 1));
    $('.lightbox__nav--next', this.el).addEventListener('click', () => this.show(this.index + 1));
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close(); // click în afara imaginii
    });
    document.addEventListener('keydown', (e) => {
      if (this.el.hidden) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.show(this.index - 1);
      if (e.key === 'ArrowRight') this.show(this.index + 1);
    });
  },

  open(items, startIndex = 0) {
    if (!items.length) return;
    this.build();
    this.items = items;
    this.el.hidden = false;
    document.body.classList.add('nav-locked');
    this.show(startIndex);
    $('.lightbox__close', this.el).focus();
  },

  show(i) {
    const total = this.items.length;
    this.index = (i + total) % total;
    const item = this.items[this.index];
    const img = $('.lightbox__img', this.el);
    img.src = item.src;
    img.alt = item.alt || '';
    $('.lightbox__counter', this.el).textContent = total > 1 ? `${this.index + 1} / ${total}` : '';
    this.el.classList.toggle('lightbox--single', total < 2);
  },

  close() {
    if (!this.el) return;
    this.el.hidden = true;
    document.body.classList.remove('nav-locked');
  },
};

/* imaginile marcate cu data-zoom se deschid în lupă (ex. cele 2 organigrame) */
function initZoomImages() {
  const frames = $$('[data-zoom]');
  if (!frames.length) return;
  frames.forEach((frame) => {
    frame.addEventListener('click', () => {
      const available = frames.filter((f) => !f.classList.contains('is-empty'));
      if (frame.classList.contains('is-empty')) return;
      Lightbox.open(
        available.map((f) => ({ src: f.dataset.zoom, alt: f.dataset.zoomAlt || '' })),
        available.indexOf(frame)
      );
    });
  });
}

function initGalleryPage() {
  const root = $('#gallery-root');
  if (!root) return;

  /* întâi pozele echipei (echipa1…5), apoi restul galeriei (poza1…poza20) */
  const fisiere = [
    ...Array.from({ length: CONFIG.teamPhotoCount }, (_, i) => `echipa${i + 1}.png`),
    ...Array.from({ length: CONFIG.galleryCount }, (_, i) => `poza${i + 1}.png`),
  ];

  root.innerHTML = `
    <div class="photo-grid">
      ${fisiere
        .map(
          (fisier, i) => `
        <button class="photo-item" type="button" data-zoom="${imgPath(fisier)}" data-zoom-alt="Echipa MKTech — fotografia ${i + 1}">
          <span class="photo-item__soon">Imagine în curând</span>
          <img src="${imgPath(fisier)}" alt="Echipa MKTech — fotografia ${i + 1}" loading="lazy" onerror="zoomImageFallback(this)">
        </button>`
        )
        .join('')}
    </div>`;

  initZoomImages();
}

/* =====================================================================
   9. PORNIRE
   ===================================================================== */
function init() {
  CURRENT_LANG = LANGS.some((l) => l.code === storage.get(STORAGE_KEYS.lang, 'ro'))
    ? storage.get(STORAGE_KEYS.lang, 'ro')
    : 'ro';
  buildSearchIndex();
  mountLayout();
  hydrateIcons();
  updateHeaderState();
  initNavigation();
  initLangSwitch();
  initSearch();
  initGlobalActions();

  const pages = {
    acasa: initHomePage,
    produse: initCatalogPage,
    produs: initProductPage,
    cos: initCartPage,
    favorite: initFavoritesPage,
    cont: initAccountPage,
    contact: initContactPage,
    despre: initAboutPage,
    reduceri: initDealsPage,
    noutati: initNewsPage,
    'lista-preturi': initPriceListPage,
    galerie: initGalleryPage,
  };
  const page = document.body.dataset.page;
  if (pages[page]) pages[page]();
  initZoomImages(); // imaginile care se deschid mărite (organigrame etc.)

  applyLanguage(); // traduce pagina (și tot ce apare ulterior) în limba aleasă
}

init();
