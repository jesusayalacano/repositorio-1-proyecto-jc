import HeaderBase from './HeaderBase.jsx';

const ENLACES = [
  { href: '/', texto: 'Inicio' },
  { href: '/#personalizacion', texto: 'Personalización' },
  { href: '/#ofertas', texto: 'Ofertas' },
  { href: '/#contacto', texto: 'Contacto' },
  { href: '/cuenta', texto: 'Mi cuenta' },
];

const CTA = { href: '/', texto: 'Volver al inicio' };

export default function HeaderCatalogo() {
  return <HeaderBase enlaces={ENLACES} cta={CTA} />;
}
