// app/eventos/[slug]/page.tsx
import Parser from 'rss-parser';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaTicketAlt, 
  FaMusic, 
  FaBuilding,
  FaShareAlt
} from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';

const parser = new Parser({
  customFields: {
    item: [
      ['event_id', 'event_id'],
      ['ticketLink', 'ticketLink'],
      ['minPrice', 'minPrice'],
      ['currency', 'currency'],
      ['city', 'city'],
      ['region', 'region'],
      ['venue', 'venue'],
      ['address', 'address'],
      ['dateTime', 'dateTime'],
      ['artist', 'artist']
    ],
  }
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventosExternosPage({ params }: PageProps) {
  const { slug } = await params;

  const rssUrls: Record<string, string> = {
    'keai': 'https://www.portaldisc.com/keai',
  };

  const url = rssUrls[slug];

  if (!url) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Fuente no encontrada</h1>
          <p className="text-neutral-400">La ruta /eventos/{slug} no está configurada.</p>
        </div>
      </div>
    );
  }

  try {
    const feed = await parser.parseURL(url);

    return (
      <div className="min-h-screen bg-neutral-950 p-6 md:p-10">
        <header className="max-w-7xl mx-auto mb-12 mt-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            {feed.title?.toUpperCase()}
          </h1>
          <p className="text-neutral-400 max-w-2xl">
            {feed.description}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {feed.items.map((item: any, index: number) => (
            <div 
              key={item.event_id || index} 
              className="group flex flex-col bg-neutral-800/40 backdrop-blur-sm border border-neutral-700 rounded-2xl overflow-hidden hover:border-neutral-500 transition-all duration-300 shadow-xl"
            >
              {/* Cuerpo de la tarjeta */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30">
                    {item.city}
                  </span>
                  <FaMusic className="text-neutral-600 group-hover:text-red-500 transition-colors" />
                </div>

                <h2 className="text-xl font-bold text-white mb-3 leading-tight min-h-[3.5rem] line-clamp-2">
                  {item.title}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-neutral-300">
                    <FaCalendarAlt className="text-red-400 w-4" />
                    <span className="text-sm font-medium">
                      {item.dateTime ? new Date(item.dateTime.replace(' ', 'T')).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      }) : 'Fecha por confirmar'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 text-neutral-400">
                    <MdLocationOn className="text-green-400 w-4 mt-1" />
                    <div className="text-sm">
                      <p className="text-neutral-200 font-semibold">{item.venue}</p>
                      <p className="text-xs line-clamp-1">{item.address}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-neutral-500 line-clamp-3 italic">
                  {item.description?.replace(/<[^>]*>?/gm, '')}
                </p>
              </div>
              
              {/* Footer de la tarjeta con Precio y Botón */}
              <div className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-between mb-4 pt-4 border-t border-neutral-700/50">
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold">Desde</p>
                    <p className="text-lg font-black text-white">
                      {Number(item.minPrice).toLocaleString('es-CL', { style: 'currency', currency: item.currency })}
                    </p>
                  </div>
                  <div className="p-2 bg-neutral-700/50 rounded-lg">
                    <FaTicketAlt className="text-yellow-500" />
                  </div>
                </div>

                <a 
                  href={item.ticketLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-center w-full bg-white hover:bg-neutral-200 text-black font-bold py-3 rounded-xl transition-all transform active:scale-95 shadow-lg"
                >
                  Tickets Disponibles
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error cargando RSS:", error);
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-10">
        <div className="bg-neutral-900 border border-red-900/30 p-8 rounded-2xl text-center">
          <h2 className="text-red-500 font-bold text-xl mb-2">Error de conexión</h2>
          <p className="text-neutral-400 text-sm">No pudimos obtener los eventos de PortalDisc. Intenta de nuevo.</p>
        </div>
      </div>
    );
  }
}