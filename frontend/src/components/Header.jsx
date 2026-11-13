import HeaderBase from './HeaderBase.jsx';

const ENLACES = [
  { href: '/', texto: 'Inicio' },
  { href: '#sobre-nosotros', texto: 'Nosotros' },
  { href: '#productos', texto: 'Productos' },
  { href: '#personalizacion', texto: 'Personalización' },
  { href: '#ofertas', texto: 'Ofertas' },
  { href: '#contacto', texto: 'Contacto' },
  { href: '/cuenta', texto: 'Mi cuenta' },
];

const CTA = { href: '/catalogo', texto: 'Ver catálogo' };

export default function Header() {
  return <HeaderBase enlaces={ENLACES} cta={CTA} />;
}
