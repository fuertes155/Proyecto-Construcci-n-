/** Precios publicados consultados el 2026-11-05. No se actualizan automáticamente.
 * Conservar presentación, ubicación y condiciones de la fuente al renovar los datos.
 */
export const checkedAt = new Date('2026-11-05T12:00:00-05:00');
const central = 'https://centraldematerialespasto.com/';
const hc = (id: string, slug: string) => `https://www.homecenter.com.co/homecenter-co/product/${id}/${slug}/${id}/`;
const lo = 'https://www.loencuentras.com.co/';

export const publishedProviders = [
  { key: 'central', name: 'Central de Materiales Pasto', location: 'Pasto, Nariño', phone: '+57 313 627 6123', email: 'contabilidad@centraldemateriales.com' },
  { key: 'homecenter', name: 'Homecenter Colombia', location: 'Colombia · tienda en línea', phone: '+57 310 242 7373', email: null },
  { key: 'loencuentras', name: 'Loencuentras', location: 'Bogotá, Cundinamarca', phone: '+57 313 885 0005', email: 'servicioalcliente@loencuentras.com.co' },
  { key: 'metropolis', name: 'Ferretería Metrópolis Center', location: 'Barranquilla, Atlántico', phone: '+57 320 833 6187', email: null },
  { key: 'distriarcillas', name: 'Distriarcillas', location: 'Cota, Cundinamarca', phone: '+57 313 373 0306', email: 'informacion@distriarcillas.com' },
  { key: 'vasanico', name: 'Vasanico SAS', location: 'Colombia · tienda en línea', phone: '+57 601 790 2565', email: null },
  { key: 'bervar', name: 'Ferretería Bervar', location: 'Cali, Valle del Cauca', phone: '+57 318 638 3232', email: 'ventas@ferreteriabervar.com' },
] as const;

interface PublishedPrice {
  materialKey: string;
  providerKey: typeof publishedProviders[number]['key'];
  price: number;
  sourceUrl: string;
  sourceProduct: string;
  sourceNotes: string;
}
const local = 'Precio publicado en Pasto; confirmar precio final y disponibilidad por WhatsApp.';
const online = 'Precio de la tienda en línea; confirmar disponibilidad, precio para tu ciudad y transporte.';
const noStock = 'La página indica sin stock. Precio publicado; consultar reposición y precio para tu ciudad.';
const aggregate = 'Precio por m³. Pedido mínimo de 6 m³ y entrega en Bogotá; no es una cotización en Nariño.';
const entry = (materialKey: string, providerKey: PublishedPrice['providerKey'], price: number, sourceUrl: string, sourceProduct: string, sourceNotes = online): PublishedPrice =>
  ({ materialKey, providerKey, price, sourceUrl, sourceProduct, sourceNotes });

export const publishedPrices: PublishedPrice[] = [
  entry('cemento', 'central', 32000, central, 'Cemex uso general, 50 kg', local),
  entry('cemento', 'homecenter', 32500, hc('13846', 'cemento-argos-gris-50kg'), 'Argos gris, 50 kg'),
  entry('arena', 'loencuentras', 190000, lo + 'agregados-y-material-de-cantera/46-arena-de-rio.html', 'Arena de río, m³', aggregate),
  entry('grava', 'loencuentras', 190000, lo + 'agregados-y-material-de-cantera/1428-grava-1-1-2.html', 'Grava de 3/4 pulg, m³', aggregate),
  entry('ladrillo', 'homecenter', 900, 'https://www.homecenter.com.co/homecenter-co/k/ladrillo-tolete-comun', 'Tolete n.º 2 de dos huecos, 24 x 12 x 6 cm, Ladrillera Barranquilla'),
  entry('bloque', 'homecenter', 3000, hc('47735', 'bloque-cemento-10-x-20-x-40-cm-3h-125u-m2-10-mpa'), 'Conpre concreto, 10 x 20 x 40 cm', noStock),
  entry('mortero', 'homecenter', 8900, hc('143418', 'mortero-seco-para-pisos-40-kg'), 'Topex mortero seco, 40 kg', noStock),
  entry('varilla', 'central', 28100, central + 'productos.html?category=Acero', 'Varilla W60 de 1/2 pulg x 6 m', local),
  entry('pintura', 'central', 65900, central + 'productos.html?category=Pinturas', 'Sultán T1 blanco lavable, galón', local),
  entry('alambre', 'metropolis', 7001, 'https://www.metropoliscenter.com.co/p/alambre-recocido-negro-cal-18-x-kg/', 'Alambre recocido negro calibre 18, kg'),
  entry('baldosa', 'homecenter', 28900, hc('901712', 'piso-ceramica-grimes-448x448cm-cj200m2'), 'Holztek Grimes, 44,8 x 44,8 cm', 'Precio por m²; se vende en caja de 2 m² por $57.800. ' + online),
  entry('pegante', 'homecenter', 36900, hc('3080325', 'pegante-ceramico-para-pisos-y-paredes-exterior-gris-25-kg-topex'), 'Topex cerámico gris, 25 kg'),
  entry('boquilla', 'homecenter', 16900, 'https://www.homecenter.com.co/homecenter-co/category/cat940033/pisos-pinturas-y-terminaciones/?f.product.attribute.Tipo=boquilla%3A%3Acombos%2520puertas%2520de%2520interior%3A%3Acruceta%2520plastica%3A%3Allanas%3A%3Amasillas%3A%3Apuerta%2520interior%3A%3Arodillos', 'Concolor junta estrecha gris cemento, 2 kg'),
  entry('piedra', 'loencuentras', 135000, lo + 'agregados-y-material-de-cantera/42-rajon.html', 'Piedra rajón, m³', aggregate),
  entry('arenaPena', 'loencuentras', 145000, lo + 'agregados-y-material-de-cantera/67-arena-de-pena.html', 'Arena de peña, m³', aggregate),
  entry('cal', 'vasanico', 55335, 'https://vasanico.com.co/product/cal-hidratada-tipo-n/', 'Cal hidratada tipo N, saco 25 kg'),
  entry('bloqueArcilla', 'distriarcillas', 1500, 'https://distriarcillas.com/producto/bloque-4/', 'Bloque rosado de arcilla n.º 4, 30 x 10 x 20 cm'),
  entry('bloque6', 'homecenter', 4300, hc('47729', 'bloque-cemento-15-x-20-x-40-cm-125u-m2-10-mpa'), 'Conpre concreto, 15 x 20 x 40 cm', noStock),
  entry('varilla38', 'central', 16500, central + 'productos.html?category=Acero', 'Varilla W60 de 3/8 pulg x 6 m', local),
  entry('varilla58', 'central', 43000, central + 'productos.html?category=Acero', 'Varilla W60 de 5/8 pulg x 6 m', local),
  entry('malla', 'central', 125000, central + 'productos.html?category=Acero', 'Malla plana electrosoldada, diámetro 4 mm, 2,35 x 6 m', 'Consultar tamaño de cuadrícula con el proveedor. ' + local),
  entry('pintura2', 'homecenter', 54400, hc('320525', 'pintura-corona-total-tipo-2-blanco-1-galon'), 'Corona Total tipo 2 blanco, galón', noStock),
  entry('pinturaExt', 'homecenter', 139900, hc('25440', 'pintura-para-exterior-blanca-koraza-1-galon'), 'Koraza exterior blanco, galón'),
  entry('estuco', 'homecenter', 39900, hc('361573', 'estucor-estuco-professional-25kg'), 'Corona Estucor Professional en polvo, 25 kg', noStock),
  entry('porcelanato', 'homecenter', 31319, hc('205514', 'piso-porcelanico-sellado-beige-veta-60x60cm-caja144-m2'), 'Holztek Beige Veta, 60 x 60 cm', 'Precio por m²; caja de 1,44 m² por $45.100. ' + noStock),
  entry('pegantePorc', 'homecenter', 54900, hc('132820', 'pegante-porcelanico-topex-gris-25kg-alta-adherencia-para-interiores'), 'Topex porcelánico gris interior, 25 kg'),
  entry('tejaFibro', 'central', 37200, central + 'productos.html?category=Materiales+de+construcci%C3%B3n', 'Teja Eternit n.º 6, unidad', local),
  entry('tejaZinc', 'homecenter', 22900, hc('714331', 'teja-zinc-ondulada-305x080m-c35-duratecho-013mm-fajobe'), 'Fajobe zinc ondulada 3,05 x 0,80 m, calibre 35'),
  entry('gancho', 'metropolis', 2817, 'https://www.metropoliscenter.com.co/p/gancho-teja-ondulada-eternit-55-mm/', 'Gancho Eternit para teja ondulada, 55 mm, unidad'),
  entry('impermeabilizante', 'homecenter', 75900, hc('685005', 'impermeabilizante-acrilico-impertexsa-7-anos-gris-1-galon-para-cubiertas'), 'Texsa Impertexsa acrílico gris 7 años, galón'),
  entry('pvcSanitario', 'homecenter', 49000, hc('235049', 'tubo-sanitario-4x6m'), 'Tigre PVC sanitario de 4 pulg x 6 m', noStock),
  entry('pvcPresion', 'central', 22500, central + 'productos.html?category=Materiales+de+construcci%C3%B3n', 'PVC presión de 1/2 pulg x 6 m, RDE 9', local),
  entry('puntilla', 'bervar', 5600, 'https://www.ferreteriabervar.com/products/puntilla-hierro-con-cabeza-2-x-libra', 'Puntilla de hierro con cabeza, 2 pulg, libra'),
  entry('formaleta', 'loencuentras', 30500, lo + 'maderas/380-tabla-burra-de-3-metros.html', 'Tabla burra de 3 m x 30 cm, espesor 2,3 cm', 'Precio publicado ANTES de IVA; confirmar impuesto y transporte. Madera sin cepillar.'),
];
