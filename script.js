/* =====================================================================
   MKTech — script.js
   Tot JavaScript-ul site-ului: date produse, randare, coș, favorite,
   cont, căutare, carusel, meniu mobil, formular de contact.
   Vanilla JS, fără librării externe.

   CUPRINS
   1. Configurare (link-uri social media, folder imagini, formular contact)
   2. Categorii & catalog produse
   3. Utilitare (formatare preț, căutare, localStorage, iconițe)
   4. Coș, favorite, cont (stocate în localStorage)
   5. Header, navigare, footer (comune pe toate paginile)
   6. Căutare live
   7. Card produs + notificări (toast)
   8. Pagini: index, produse, produs, coș, favorite, cont, contact
   9. Pornire
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
};

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
    id: 'monitor-1', category: 'monitoare', img: 'monitor1', price: 699,
    name: `LED Philips 275S1AE de 27 inchi`,
    description: `Monitor IPS de 27" cu rezoluție QHD (2560×1440), ideal pentru muncă și divertisment. Oferă imagini clare, tehnologie Adaptive-Sync pentru fluiditate, protecție pentru ochi prin TUV Eye Comfort și suport ergonomic reglabil. Garanție 36 luni.`,
    specs: [['Diagonală', '27"'], ['Tip panou', 'IPS'], ['Rezoluție', 'QHD (2560×1440)'], ['Sincronizare', 'Adaptive-Sync'], ['Protecția ochilor', 'TUV Eye Comfort'], ['Suport', 'Ergonomic, reglabil'], ['Garanție', '36 luni']],
  },
  {
    id: 'monitor-2', category: 'monitoare', img: 'monitor2', price: 750, oldPrice: 899,
    name: `LED Philips 24" 24B2N2200 24B2N2200/00`,
    description: `Monitor PHILIPS de 23,8” Full HD cu rată de reîmprospătare de 120 Hz, ideal pentru birou și utilizare zilnică. Oferă imagini clare, unghiuri largi de vizualizare, consum redus de energie și compatibilitate VESA pentru montare ușoară. Garanție 24 luni.`,
    specs: [['Diagonală', '23,8"'], ['Rezoluție', 'Full HD'], ['Rată de reîmprospătare', '120 Hz'], ['Unghiuri de vizualizare', 'Largi'], ['Montare', 'Compatibil VESA'], ['Garanție', '24 luni']],
  },
  {
    id: 'monitor-3', category: 'monitoare', img: 'monitor3', price: 889,
    name: `Acer/SA243YGOwi/23.8"/IPS/FHD/120Hz/1ms/Alb`,
    description: `Monitor ACER de 23,8” Full HD cu rată de reîmprospătare de 120 Hz și timp de răspuns de 1 ms, oferind imagini fluide și clare. Ideal pentru acasă sau birou, cu unghiuri largi de vizualizare și design modern, compatibil cu montare VESA. Garanție 24 luni.`,
    specs: [['Diagonală', '23,8"'], ['Tip panou', 'IPS'], ['Rezoluție', 'Full HD'], ['Rată de reîmprospătare', '120 Hz'], ['Timp de răspuns', '1 ms'], ['Culoare', 'Alb'], ['Montare', 'Compatibil VESA'], ['Garanție', '24 luni']],
  },
  {
    id: 'monitor-4', category: 'monitoare', img: 'monitor4', price: 1069,
    name: `Samsung Odyssey G5 C34G55TWWP Monitor`,
    description: `Monitor curbat Samsung Odyssey G5 de 34” cu rezoluție Ultra WQHD, rată de reîmprospătare de 165 Hz și timp de răspuns de 1 ms. Oferă o experiență de gaming captivantă, imagini fluide prin AMD FreeSync Premium și culori vibrante datorită tehnologiei HDR10.`,
    specs: [['Diagonală', '34"'], ['Tip ecran', 'Curbat'], ['Rezoluție', 'Ultra WQHD'], ['Rată de reîmprospătare', '165 Hz'], ['Timp de răspuns', '1 ms'], ['Sincronizare', 'AMD FreeSync Premium'], ['HDR', 'HDR10']],
  },
  {
    id: 'monitor-5', category: 'monitoare', img: 'monitor5', price: 1299,
    name: `Samsung ViewFinity S7 S37D700EAU Monitor`,
    description: `Monitor LED de 37” cu rezoluție 4K Ultra HD (3840×2160), ideal pentru productivitate și multimedia. Panoul VA oferă culori intense și contrast ridicat, iar difuzoarele integrate și conectivitatea HDMI/DisplayPort asigură o experiență completă de utilizare.`,
    specs: [['Diagonală', '37"'], ['Tip panou', 'VA'], ['Rezoluție', '4K Ultra HD (3840×2160)'], ['Audio', 'Difuzoare integrate'], ['Conectivitate', 'HDMI, DisplayPort']],
  },
  {
    id: 'monitor-6', category: 'monitoare', img: 'monitor6', price: 1690,
    name: `EIZO FlexScan EV2490-WT Full HD LED Alb`,
    description: `Monitor IPS Full HD cu conectivitate USB-C și alimentare de până la 70W, ideal pentru birou și productivitate. Oferă imagini clare, multi-monitor, tehnologii avansate de protecție a ochilor pentru confort pe termen lung.`,
    specs: [['Tip panou', 'IPS'], ['Rezoluție', 'Full HD'], ['Conectivitate', 'USB-C'], ['Alimentare prin USB-C', 'Până la 70W'], ['Configurație', 'Multi-monitor'], ['Culoare', 'Alb']],
  },

  /* ---------- PERIFERICE ---------- */
  {
    id: 'periferic-1', category: 'periferice', img: 'periferic1', price: 759,
    name: `Tastatură mecanică gaming BlackWidow V4`,
    description: `Tastatură mecanică Razer BlackWidow V4 Pro, echipată cu switch-uri Razer Green pentru răspuns rapid și precis. Dispune de iluminare RGB personalizabilă, design ergonomic și construcție durabilă, fiind ideală pentru gaming și utilizare intensivă.`,
    specs: [['Tip', 'Tastatură mecanică gaming'], ['Model', 'Razer BlackWidow V4 Pro'], ['Switch-uri', 'Razer Green'], ['Iluminare', 'RGB personalizabilă'], ['Design', 'Ergonomic']],
  },
  {
    id: 'periferic-2', category: 'periferice', img: 'periferic2', price: 250,
    name: `Razer Basilisk V3 Pro (RZ01-04620100-R3G1) Mouse`,
    description: `Mouse gaming wireless Razer Basilisk V3 Pro, dotat cu senzor optic de până la 30.000 DPI pentru precizie excepțională. Dispune de 11 butoane programabile, iluminare Razer Chroma RGB și conectivitate wireless ultra-rapidă, oferind confort și performanță de top în orice sesiune de gaming.`,
    specs: [['Tip', 'Mouse gaming wireless'], ['Senzor', 'Optic, până la 30.000 DPI'], ['Butoane', '11 programabile'], ['Iluminare', 'Razer Chroma RGB'], ['Conectivitate', 'Wireless']],
  },
  {
    id: 'periferic-3', category: 'periferice', img: 'periferic3', price: 602,
    name: `Brother/HL-L2402DYJ1/Print/Laser/A4/USB HLL2402DYJ1`,
    description: `Imprimantă laser Brother monocromă, ideală pentru birou, cu viteză de imprimare de până la 28 pagini pe minut și rezoluție de 1200×1200 dpi. Dispune de imprimare față-verso automată, tavă de 250 de coli și consum redus de toner pentru eficiență sporită.`,
    specs: [['Tip', 'Imprimantă laser monocromă'], ['Format', 'A4'], ['Viteză de imprimare', 'Până la 28 pagini/minut'], ['Rezoluție', '1200×1200 dpi'], ['Față-verso', 'Automată'], ['Tavă hârtie', '250 de coli'], ['Conectivitate', 'USB']],
  },
  {
    id: 'periferic-4', category: 'periferice', img: 'periferic4', price: 1377,
    name: `Scanner documente IRIScan Desk 6`,
    description: `Scanner portabil IRIScan Desk 6 cu cameră de 8 MP și funcție OCR, ideal pentru digitalizarea rapidă a documentelor A4. Scanează în mai puțin de o secundă, oferă conversie în PDF, Word și Excel și include iluminare LED integrată pentru imagini clare și precise.`,
    specs: [['Tip', 'Scanner portabil'], ['Cameră', '8 MP'], ['Format documente', 'A4'], ['Funcție OCR', 'Da'], ['Timp de scanare', 'Sub o secundă'], ['Export', 'PDF, Word, Excel'], ['Iluminare', 'LED integrată']],
  },
  {
    id: 'periferic-5', category: 'periferice', img: 'periferic5', price: 359, oldPrice: 429,
    name: `Logitech Brio 500 cameră web 4 MP 1920x1080 Pixel USB-C Grafit`,
    description: `Cameră web Logitech Brio 500 cu rezoluție Full HD 1080p, ideală pentru videoconferințe, streaming și cursuri online. Dispune de corecție automată a luminii, microfoane cu reducerea zgomotului și capac de confidențialitate integrat, oferind imagine și sunet de înaltă calitate.`,
    specs: [['Rezoluție video', 'Full HD 1080p (1920×1080)'], ['Senzor', '4 MP'], ['Conectare', 'USB-C'], ['Lumină', 'Corecție automată'], ['Microfoane', 'Cu reducerea zgomotului'], ['Confidențialitate', 'Capac integrat'], ['Culoare', 'Grafit']],
  },
  {
    id: 'periferic-6', category: 'periferice', img: 'periferic6', price: 879,
    name: `Polk Monitor XT15 (x2) Boxe audio`,
    description: `Boxe de raft Polk Monitor XT15, concepute pentru un sunet clar și echilibrat. Echipate cu tweeter de 1” și woofer de 5,25”, oferă redare detaliată a muzicii și filmelor, cu răspuns în frecvență extins și compatibilitate cu amplificatoare de 30–150 W.`,
    specs: [['Tip', 'Boxe de raft'], ['Pachet', '2 boxe (x2)'], ['Tweeter', '1"'], ['Woofer', '5,25"'], ['Amplificatoare compatibile', '30–150 W']],
  },

  /* ---------- UNITĂȚI ---------- */
  {
    id: 'unitate-1', category: 'unitati', img: 'unitate1', price: 4599,
    name: `HP ProDesk 2 SFF G1i, Core i5-14400 2.5GHz, 512GB SSD, 8GB RAM`,
    description: `Unitate centrală HP cu procesor Intel Core i5, SSD de 512 GB și sistem de operare Windows 11 Pro, concepută pentru productivitate și utilizare profesională. Oferă pornire rapidă, conectivitate modernă prin HDMI, DisplayPort și USB-C, fiind ideală pentru birou și activități de zi cu zi.`,
    specs: [['Procesor', 'Intel Core i5-14400 (2.5GHz)'], ['Memorie RAM', '8GB'], ['Stocare', '512GB SSD'], ['Sistem de operare', 'Windows 11 Pro'], ['Format carcasă', 'SFF'], ['Porturi', 'HDMI, DisplayPort, USB-C']],
  },
  {
    id: 'unitate-2', category: 'unitati', img: 'unitate2', price: 3445, oldPrice: 3999,
    name: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400, 16GB, 512GB SSD, Intel UHD 730`,
    description: `Dell Pro Tower Essential QVT1260, Intel Core i5-14400 (4.7GHz), 16GB RAM, 512GB SSD, Intel UHD 730, Windows 11 Pro.`,
    specs: [['Procesor', 'Intel Core i5-14400 (4.7GHz)'], ['Memorie RAM', '16GB'], ['Stocare', '512GB SSD'], ['Placă video', 'Intel UHD 730'], ['Sistem de operare', 'Windows 11 Pro']],
  },
  {
    id: 'unitate-3', category: 'unitati', img: 'unitate3', price: 3681,
    name: `CHS PC Barracuda, Core i5-12400 2.5GHz, 16GB, 512GB SSD, mouse+tastatură, Windows 11 Pro`,
    description: `Sistem desktop echipat cu procesor Intel Core i5-12400, 16 GB RAM și SSD de 512 GB, oferind performanță rapidă pentru activități de birou, studiu și multitasking. Include Windows 11 Pro, tastatură și mouse, fiind o soluție completă și gata de utilizare.`,
    specs: [['Procesor', 'Intel Core i5-12400 (2.5GHz)'], ['Memorie RAM', '16GB'], ['Stocare', '512GB SSD'], ['Sistem de operare', 'Windows 11 Pro'], ['Accesorii incluse', 'Tastatură și mouse']],
  },
  {
    id: 'unitate-4', category: 'unitati', img: 'unitate4', price: 6677,
    name: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, W11H`,
    description: `Komputer HIRO Aurora Intel i5 14400F, RTX 5070 12GB, 32GB RAM, 1TB SSD, WIFI, Windows 11 Home.`,
    specs: [['Procesor', 'Intel i5 14400F'], ['Placă video', 'RTX 5070 12GB'], ['Memorie RAM', '32GB'], ['Stocare', '1TB SSD'], ['Wireless', 'WiFi'], ['Sistem de operare', 'Windows 11 Home']],
  },
  {
    id: 'unitate-5', category: 'unitati', img: 'unitate5', price: 10159,
    name: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD`,
    description: `KOMPUTER HIRO Wingman — AMD Ryzen 7 9800X3D, RTX 5080 16GB, 32GB RAM, 2TB SSD, Windows 11 Home.`,
    specs: [['Procesor', 'AMD Ryzen 7 9800X3D'], ['Placă video', 'RTX 5080 16GB'], ['Memorie RAM', '32GB'], ['Stocare', '2TB SSD'], ['Sistem de operare', 'Windows 11 Home']],
  },
  {
    id: 'unitate-6', category: 'unitati', img: 'unitate6', price: 3199,
    name: `Lenovo ThinkCentre Neo 50t 12UD0033RI`,
    description: `Lenovo ThinkCentre Neo 50t 12UD0033RI este un desktop pentru birou și acasă, echipat cu procesor Intel Core i5 la 2500 MHz (socket LGA1700) și 8 GB memorie RAM, oferind performanță stabilă pentru activități zilnice.`,
    specs: [['Model', 'ThinkCentre Neo 50t (12UD0033RI)'], ['Procesor', 'Intel Core i5 (2500 MHz)'], ['Socket', 'LGA1700'], ['Memorie RAM', '8 GB']],
  },

  /* ---------- LAPTOPURI ---------- */
  {
    id: 'laptop-1', category: 'laptopuri', img: 'laptop1', price: 2599,
    name: `MacBook Air 13'' 2020, M1 8 Cores, 8GB, 7-core GPU, 256GB`,
    description: `MacBook Air 13” (2020) este un laptop ușor și portabil, cu procesor Apple M1, 8 GB RAM, SSD de 256 GB și ecran Retina de 13,3”, oferind performanță bună pentru muncă și divertisment.`,
    specs: [['Procesor', 'Apple M1 (8 nuclee)'], ['Placă video', 'GPU cu 7 nuclee'], ['Memorie RAM', '8 GB'], ['Stocare', '256 GB SSD'], ['Ecran', 'Retina 13,3"'], ['An', '2020']],
  },
  {
    id: 'laptop-2', category: 'laptopuri', img: 'laptop2', price: 6779,
    name: `Laptop ASUS ROG Strix Scar 18 inch 2.5K Intel Core Ultra`,
    description: `Laptop ASUS ROG Strix Scar 18 inch 2.5K, Intel Core Ultra 9 275HX, 64GB RAM, 2TB SSD, RTX 5080, Free DOS, Off Black.`,
    specs: [['Ecran', '18" 2.5K'], ['Procesor', 'Intel Core Ultra 9 275HX'], ['Memorie RAM', '64GB'], ['Stocare', '2TB SSD'], ['Placă video', 'RTX 5080'], ['Sistem de operare', 'Free DOS'], ['Culoare', 'Off Black']],
  },
  {
    id: 'laptop-3', category: 'laptopuri', img: 'laptop3', price: 3459, oldPrice: 3899,
    name: `Laptop Lenovo ThinkPad T14 Gen 5 cu procesor Intel`,
    description: `Lenovo ThinkPad T14 Gen 5 este un laptop profesional de 14”, echipat cu procesor Intel Core Ultra 7 155U, 64 GB RAM DDR5 și SSD de 1 TB. Oferă performanță ridicată, funcții AI integrate, ecran WUXGA IPS de calitate, securitate avansată și durabilitate certificată MIL-STD-810H.`,
    specs: [['Ecran', '14" WUXGA IPS'], ['Procesor', 'Intel Core Ultra 7 155U'], ['Memorie RAM', '64 GB DDR5'], ['Stocare', '1 TB SSD'], ['Funcții AI', 'Integrate'], ['Durabilitate', 'Certificare MIL-STD-810H']],
  },
  {
    id: 'laptop-4', category: 'laptopuri', img: 'laptop4', price: 3851,
    name: `Laptop Acer Aspire Go 15 - AG15-42P-R1ME argintiu`,
    description: `Laptopul de 15,6” este echipat cu procesor AMD Ryzen 5/7, placă video integrată AMD Radeon, până la 16 GB RAM și SSD de până la 1 TB. Oferă ecran Full HD mat, conectivitate modernă și performanță potrivită pentru activități de zi cu zi și productivitate.`,
    specs: [['Ecran', '15,6" Full HD mat'], ['Procesor', 'AMD Ryzen 5/7'], ['Placă video', 'AMD Radeon (integrată)'], ['Memorie RAM', 'Până la 16 GB'], ['Stocare', 'SSD de până la 1 TB'], ['Culoare', 'Argintiu']],
  },
  {
    id: 'laptop-5', category: 'laptopuri', img: 'laptop5', price: 7585,
    name: `Apple MacBook Air 15 M4 Z1HF000EV Laptop`,
    description: `Apple MacBook Air 15.3” este un laptop performant și ușor, echipat cu procesor Apple M4, 32 GB RAM DDR5 și SSD de 512 GB. Dispune de ecran IPS de înaltă rezoluție, cameră Full HD, tastatură iluminată și sistem de operare macOS, fiind ideal pentru productivitate și utilizare zilnică.`,
    specs: [['Ecran', '15,3" IPS, înaltă rezoluție'], ['Procesor', 'Apple M4'], ['Memorie RAM', '32 GB DDR5'], ['Stocare', '512 GB SSD'], ['Cameră', 'Full HD'], ['Tastatură', 'Iluminată'], ['Sistem de operare', 'macOS']],
  },
  {
    id: 'laptop-6', category: 'laptopuri', img: 'laptop6', price: 4559,
    name: `Laptop 25-26 de 15,6 inci pentru Windows 11, procesor cu 4 nuclee`,
    description: `Laptopul de 15,6” este echipat cu procesor Intel Celeron N5095, 32 GB RAM LPDDR4 și SSD, oferind performanță potrivită pentru activități de birou și studiu. Dispune de ecran Full HD IPS, cititor de amprentă și conectivitate Wi-Fi și Bluetooth.`,
    specs: [['Ecran', '15,6" Full HD IPS'], ['Procesor', 'Intel Celeron N5095 (4 nuclee)'], ['Memorie RAM', '32 GB LPDDR4'], ['Stocare', 'SSD'], ['Securitate', 'Cititor de amprentă'], ['Conectivitate', 'Wi-Fi, Bluetooth'], ['Sistem de operare', 'Windows 11']],
  },

  /* ---------- CONSUMABILE ȘI RECHIZITE ---------- */
  {
    id: 'consumabil-1', category: 'consumabile', img: 'consumabil1', price: 25,
    name: `Hârtie copiator A4 Niveus Fit 80 g/mp, 500 coli/top`,
    description: `Hârtia copiator Niveus Fit+ A4 este o hârtie de clasă B+, cu gramaj de 80 g/mp și grad ridicat de alb, potrivită pentru imprimare și copiere zilnică. Este recomandată pentru imprimante inkjet și laser, copiatoare și faxuri, oferind imprimări clare, atât alb-negru, cât și color.`,
    specs: [['Format', 'A4'], ['Gramaj', '80 g/mp'], ['Cantitate', '500 coli/top'], ['Clasă', 'B+'], ['Compatibilitate', 'Imprimante inkjet și laser, copiatoare, faxuri']],
  },
  {
    id: 'consumabil-2', category: 'consumabile', img: 'consumabil2', price: 115,
    name: `Set de pixuri BIC Cristal - 1.0 mm, albastru, 50 buc`,
    description: `Pixul BIC Cristal albastru este un instrument de scris realizat din plastic, potrivit pentru școală și birou. Recomandat pentru copii de peste 6 ani și pentru elevii din clasele V–XII, acesta oferă o scriere clară și confortabilă în utilizarea zilnică.`,
    specs: [['Grosime vârf', '1.0 mm'], ['Culoare', 'Albastru'], ['Cantitate', '50 buc'], ['Material', 'Plastic'], ['Vârstă recomandată', 'Peste 6 ani']],
  },
  {
    id: 'consumabil-3', category: 'consumabile', img: 'consumabil3', price: 18,
    name: `Creioane grafit KOH-I-NOOR 2B / 5,6 mm, 6 buc`,
    description: `Creioanele grafit KOH-I-NOOR 2B, 5,6 mm sunt ideale pentru scriere, desen și schițe. Setul conține 6 creioane cu mină moale de tip 2B, care oferă linii clare și uniforme, fiind potrivite atât pentru uz școlar, cât și pentru activități artistice.`,
    specs: [['Duritate', '2B (mină moale)'], ['Diametru', '5,6 mm'], ['Cantitate', '6 buc'], ['Utilizare', 'Scriere, desen, schițe']],
  },
  {
    id: 'consumabil-4', category: 'consumabile', img: 'consumabil4', price: 35,
    name: `Set caiete OXFORD Multicolor`,
    description: `Setul de caiete OXFORD Multicolor este potrivit pentru școală, facultate sau birou. Caietele au hârtie de calitate și coperți în culori variate, fiind ideale pentru organizarea notițelor și a activităților zilnice.`,
    specs: [['Brand', 'OXFORD'], ['Tip', 'Set caiete'], ['Coperți', 'Culori variate'], ['Utilizare', 'Școală, facultate, birou']],
  },
  {
    id: 'consumabil-5', category: 'consumabile', img: 'consumabil5', price: 25,
    name: `Dosare din plastic A4 cu capsă DONAU`,
    description: `Mapele din plastic A4 cu capsă DONAU sunt ideale pentru păstrarea și organizarea documentelor. Realizate din material PP rezistent, cu grosime de 180 μm, acestea protejează eficient actele și permit închiderea sigură cu ajutorul capsei. Setul conține 5 mape, potrivite pentru școală, birou sau arhivare.`,
    specs: [['Format', 'A4'], ['Închidere', 'Capsă'], ['Material', 'PP'], ['Grosime', '180 μm'], ['Cantitate', '5 mape']],
  },
  {
    id: 'consumabil-6', category: 'consumabile', img: 'consumabil6', price: 55, oldPrice: 69,
    name: `Cartuș Canon CLI-581 XXL CMYK, PGI-580 XXL, 5-pack`,
    description: `Setul de cartușe cu cerneală CLI-581/PGI-580 este compatibil cu imprimantele Canon și conține cartușe în variantă multipack. Acesta oferă imprimări clare și culori de calitate, fiind potrivit atât pentru documente, cât și pentru imagini.`,
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
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  bag: '<path d="M5 8h14l-1 12.5H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14a6.5 6.5 0 0 1 3 6"/>',
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
  return `<span class="brand-logo ${extraClass}"><img src="${imgPath('logo.png')}" alt="MKTech" width="500" height="500" onerror="logoFallback(this)"><span class="brand-logo__text" aria-hidden="true"><b>M</b><i>K</i><small>TECH</small></span></span>`;
}

function headerMarkup() {
  const page = document.body.dataset.page || '';
  const isActive = (name) => (page === name ? ' is-active' : '');
  const categoryLinks = CATEGORIES.map(
    (c) => `<li><a href="produse.html#${c.id}">${icon(c.icon)}<span>${c.name}<small>${productsInCategory(c.id).length} produse</small></span></a></li>`
  ).join('');

  return `
  <a class="skip-link" href="#main">Sari la conținut</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="MKTech — pagina principală">${logoMarkup()}</a>

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
          <button class="nav-link nav-dropdown-toggle${isActive('produse')}${isActive('produs')}" type="button" aria-expanded="false" aria-controls="nav-dropdown">
            Produse ${icon('chevronDown', 'nav-link__chevron')}
          </button>
          <div class="nav-dropdown" id="nav-dropdown">
            <ul class="nav-dropdown__list">${categoryLinks}</ul>
            <a class="nav-dropdown__all" href="produse.html">Vezi toate produsele ${icon('arrowRight')}</a>
          </div>
        </li>
        <li class="nav-item"><a class="nav-link${isActive('acasa')}" href="index.html">Acasă</a></li>
        <li class="nav-item"><a class="nav-link${isActive('despre')}" href="despre.html">Despre noi</a></li>
        <li class="nav-item"><a class="nav-link${isActive('contact')}" href="contact.html">Contact</a></li>
      </ul>

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
        <ul>${CATEGORIES.map((c) => `<li><a href="produse.html#${c.id}">${c.name}</a></li>`).join('')}</ul>
      </div>

      <div class="footer-col">
        <h2 class="footer-col__title">Companie</h2>
        <ul>
          <li><a href="index.html">Acasă</a></li>
          <li><a href="produse.html">Toate produsele</a></li>
          <li><a href="despre.html">Despre noi</a></li>
          <li><a href="contact.html">Contact</a></li>
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

/* Meniu mobil (hamburger) + dropdown „Produse” */
function initNavigation() {
  const nav = $('.main-nav');
  if (!nav) return;
  const toggle = $('.nav-toggle', nav);
  const dropdownItem = $('.nav-item--dropdown', nav);
  const dropdownToggle = $('.nav-dropdown-toggle', nav);
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
  const setDropdown = (open) => {
    dropdownItem.classList.toggle('is-open', open);
    dropdownToggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  dropdownToggle.addEventListener('click', () => {
    setDropdown(!dropdownItem.classList.contains('is-open'));
    fitMenu();
  });

  // Pe mobil, meniul „Produse” e deschis implicit ca acordeon
  if (!desktop.matches) setDropdown(true);

  // Închide la click pe un link (util pentru ancorele de pe aceeași pagină)
  $$('.nav-menu a', nav).forEach((a) =>
    a.addEventListener('click', () => {
      setMenu(false);
      if (desktop.matches) setDropdown(false);
    })
  );

  // Închide la click în afară / Escape
  document.addEventListener('click', (e) => {
    if (desktop.matches && !dropdownItem.contains(e.target)) setDropdown(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (dropdownItem.classList.contains('is-open') && desktop.matches) {
      setDropdown(false);
      dropdownToggle.focus();
    }
    if (nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Pe desktop, dropdown-ul se închide când focusul iese din el
  dropdownItem.addEventListener('focusout', (e) => {
    if (desktop.matches && !dropdownItem.contains(e.relatedTarget)) setDropdown(false);
  });

  desktop.addEventListener('change', () => {
    setMenu(false);
    setDropdown(!desktop.matches);
  });
}

/* =====================================================================
   6. CĂUTARE LIVE
   Caută în toate cele 30 de produse, după nume (plus numele categoriei și
   tipul produsului, ca „monitor” să găsească toate monitoarele și „imprimantă”
   imprimanta). Ignoră majusculele și diacriticele; mai multe cuvinte = toate
   trebuie să apară (în orice ordine). Potrivirile din nume apar primele.
   ===================================================================== */
const SEARCH_INDEX = PRODUCTS.map((p, index) => {
  const cat = categoryById(p.category);
  const type = (p.specs.find(([label]) => label === 'Tip') || [])[1] || '';
  return {
    product: p,
    index,
    name: normalizeText(p.name),
    extra: normalizeText(`${cat.name} ${cat.singular} ${cat.shortName || ''} ${type}`),
  };
});

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
                    <span class="search-result__name">${highlightMatches(p.name, query)}</span>
                    <span class="search-result__cat">${categoryById(p.category).name}</span>
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
    aria-pressed="${active}" aria-label="${active ? 'Elimină de la favorite' : 'Adaugă la favorite'}: ${escapeHTML(p.name)}"
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
      ? `<button class="btn btn--ghost btn--sm card-remove" type="button" data-fav-remove="${p.id}" aria-label="Elimină de la favorite: ${escapeHTML(p.name)}">${icon('trash')}<span>Elimină</span></button>`
      : '';

  return `
  <article class="product-card${p.oldPrice ? ' product-card--sale' : ''}" data-product="${p.id}">
    <div class="product-card__media">
      <img src="${img}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="imgFallback(this)">
      ${discount ? `<span class="discount-badge">-${discount}%</span>` : ''}
    </div>
    ${favButtonMarkup(p, 'product-card__fav')}
    <div class="product-card__body">
      <span class="product-card__cat">${cat.shortName || cat.name}</span>
      <h3 class="product-card__title"><a href="${url}" class="product-card__link">${escapeHTML(p.name)}</a></h3>
      <p class="product-card__desc">${escapeHTML(truncate(p.description, 115))}</p>
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
    btn.setAttribute('aria-label', `${label}: ${p.name}`);
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
    message: qty > 1 ? `${qty} × ${p.name}` : p.name,
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
        message: productById(id).name,
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
  document.title = `${p.name} | MKTech`;
  const metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', truncate(p.description, 155));

  const related = productsInCategory(p.category).filter((x) => x.id !== p.id).slice(0, 3);

  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="index.html">Acasă</a></li>
        <li><a href="produse.html#${cat.id}">${cat.name}</a></li>
        <li aria-current="page">${escapeHTML(p.name)}</li>
      </ol>
    </nav>

    <div class="product-layout">
      <div class="gallery">
        <div class="gallery__main">
          <img class="gallery__main-img" id="gallery-main" src="${images[0]}" alt="${escapeHTML(p.name)} — imaginea 1" onerror="imgFallback(this)">
          ${discount ? `<span class="discount-badge discount-badge--lg">-${discount}%</span>` : ''}
          <button class="gallery__nav gallery__nav--prev" type="button" aria-label="Imaginea anterioară">${icon('chevronLeft')}</button>
          <button class="gallery__nav gallery__nav--next" type="button" aria-label="Imaginea următoare">${icon('chevronRight')}</button>
          <span class="gallery__counter" aria-live="polite">1 / ${images.length}</span>
        </div>
        <div class="gallery__thumbs" role="group" aria-label="Alte imagini ale produsului"></div>
      </div>

      <div class="product-info">
        <a class="product-info__cat" href="produse.html#${cat.id}">${icon(cat.icon)} ${cat.name}</a>
        <h1 class="product-info__title">${escapeHTML(p.name)}</h1>

        <div class="product-info__price">
          ${priceMarkup(p, 'price--lg')}
          ${p.oldPrice ? `<p class="product-info__save">${icon('tag')} Economisești ${formatPrice(p.oldPrice - p.price)} (-${discount}%)</p>` : ''}
        </div>

        <p class="product-info__desc">${escapeHTML(p.description)}</p>

        <div class="purchase">
          ${qtyStepperMarkup('product-qty', 1, 'Cantitate')}
          <button class="btn btn--primary btn--lg purchase__add" type="button" data-add-to-cart="${p.id}" data-qty-from="#product-qty">
            ${icon('cart')}<span class="btn__label">Adaugă în coș</span>
          </button>
          <button class="fav-btn fav-btn--wide${Favorites.has(p.id) ? ' is-active' : ''}" type="button" data-fav="${p.id}"
            aria-pressed="${Favorites.has(p.id)}" aria-label="${Favorites.has(p.id) ? 'Elimină de la favorite' : 'Adaugă la favorite'}: ${escapeHTML(p.name)}">
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
        ${p.specs.map(([k, v]) => `<div class="spec-table__row"><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join('')}
      </dl>
    </section>

    ${
      related.length
        ? `<section class="section related" aria-labelledby="related-title">
            <div class="section-head">
              <h2 class="section-title" id="related-title">Alte produse din ${cat.name.toLowerCase()}</h2>
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
      mainImg.alt = `${p.name} — imaginea ${current + 1}`;
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
        <span class="cart-line__cat">${cat.shortName || cat.name}</span>
        <a class="cart-line__name" href="${url}">${escapeHTML(p.name)}</a>
        <div class="cart-line__unit">
          ${p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : ''}
          <span>${formatPrice(p.price)}</span><small>/ buc.</small>
        </div>
      </div>
      <div class="cart-line__qty">
        ${qtyStepperMarkup(`qty-${p.id}`, item.qty, `Cantitate pentru ${escapeHTML(p.name)}`)}
      </div>
      <div class="cart-line__subtotal">
        <span class="cart-line__subtotal-label">Subtotal</span>
        <strong data-line-subtotal>${formatPrice(p.price * item.qty)}</strong>
      </div>
      <button class="icon-btn cart-line__remove" type="button" data-remove-line="${p.id}" aria-label="Șterge din coș: ${escapeHTML(p.name)}" title="Șterge din coș">
        ${icon('trash')}
      </button>
    </li>`;
  };

  const updateSummary = () => {
    const { total, savings, count } = Cart.totals();
    $('[data-summary-count]', root).textContent = `${count} buc.`;
    $('[data-summary-subtotal]', root).textContent = formatPrice(total + savings);
    const savingsRow = $('[data-summary-savings-row]', root);
    savingsRow.hidden = savings === 0;
    $('[data-summary-savings]', root).textContent = `-${formatPrice(savings)}`;
    $('[data-summary-total]', root).textContent = formatPrice(total);
    $('[data-cart-heading-count]', root).textContent = `(${count})`;
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
        <ul class="cart-list" aria-label="Produse în coș">${items.map(lineMarkup).join('')}</ul>

        <aside class="summary-card" aria-labelledby="summary-title">
          <h2 class="summary-card__title" id="summary-title">Sumar comandă</h2>
          <dl class="summary-card__rows">
            <div><dt>Produse (<span data-summary-count></span>)</dt><dd data-summary-subtotal></dd></div>
            <div class="summary-card__savings" data-summary-savings-row><dt>Reduceri</dt><dd data-summary-savings></dd></div>
            <div class="summary-card__total"><dt>Total</dt><dd data-summary-total></dd></div>
          </dl>
          <button class="btn btn--primary btn--lg btn--block" type="button" data-checkout>${icon('check')} Finalizează comanda</button>
          <p class="demo-note">${icon('info')}<span><strong>Comandă simulată.</strong> MKTech este o firmă de exercițiu: nu se procesează nicio plată reală și nu se livrează produse.</span></p>
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
        showToast({ type: 'info', title: 'Produs eliminat din coș', message: productById(id).name });
      }, prefersReducedMotion() ? 0 : 220);
      return;
    }

    if (e.target.closest('[data-clear-cart]')) {
      if (window.confirm('Sigur vrei să golești coșul?')) {
        Cart.clear();
        render();
      }
      return;
    }

    if (e.target.closest('[data-checkout]')) {
      const { total, count } = Cart.totals();
      const user = Auth.current();
      const orderNo = `MK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      Cart.clear(); // comandă simulată: golim coșul
      root.innerHTML = `
        <div class="order-success" role="status">
          <span class="order-success__icon">${icon('check')}</span>
          <h1 class="order-success__title">Comanda a fost plasată cu succes!</h1>
          <p class="order-success__text">${user ? `Mulțumim, ${escapeHTML(user.name.split(' ')[0])}! ` : 'Mulțumim! '}Mai jos găsești detaliile comenzii.</p>
          <dl class="order-success__details">
            <div><dt>Număr comandă</dt><dd>${orderNo}</dd></div>
            <div><dt>Produse</dt><dd>${count}</dd></div>
            <div><dt>Total</dt><dd>${formatPrice(total)}</dd></div>
          </dl>
          <p class="demo-note demo-note--center">${icon('info')}<span>Aceasta este o <strong>comandă simulată</strong> (proiect de firmă de exercițiu). Nu s-a efectuat nicio plată și nu se livrează produse.</span></p>
          <a class="btn btn--primary btn--lg" href="index.html">Înapoi la magazin ${icon('arrowRight')}</a>
        </div>`;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  });

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
      showToast({ type: 'fav', title: 'Eliminat de la favorite', message: productById(id).name });
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
    const since = new Date(user.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
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

/* =====================================================================
   9. PORNIRE
   ===================================================================== */
function init() {
  mountLayout();
  hydrateIcons();
  updateHeaderState();
  initNavigation();
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
  };
  const page = document.body.dataset.page;
  if (pages[page]) pages[page]();
}

init();
