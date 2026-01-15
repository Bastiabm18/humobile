
import { getProfilesPublic } from '../actions/actions';
import CarruselBase from './CarruselBase';
import { FaUser, FaUsers, FaStore } from 'react-icons/fa';

export default async function PerfilesComponent() {
  // Traemos la data real
  const profiles = await getProfilesPublic();

  // Filtramos y mapeamos la data
  const artistas = profiles
    .filter(profile => profile.tipo === 'artista')
    .map(profile => ({
      id: profile.id,
      name: profile.nombre || 'Artista',
      imageUrl: profile.imagen_url,
      fallbackIcon: <FaUser />,
      type:'artista'
    }));

  const bandas = profiles
    .filter(profile => profile.tipo === 'banda')
    .map(profile => ({
      id: profile.id,
      name: profile.nombre || 'Banda',
      imageUrl: profile.imagen_url,
      fallbackIcon: <FaUsers />,
      type:'banda'
    }));

  const lugares = profiles
    .filter(profile => profile.tipo === 'lugar')
    .map(profile => ({
      id: profile.id,
      name: profile.nombre || 'Local',
      imageUrl: profile.imagen_url,
      fallbackIcon: <FaStore />,
      type:'lugar'
    }));

    //console.log('lugares ',lugares)

  return (
    <div className=" min-w-screen max-w-screen">
      <CarruselBase
        items={artistas}
        title="Artistas"
        icon={<FaUser className="text-2xl text-sky-600/70" />}
      />

      <CarruselBase
        items={bandas}
        title="Bandas"
        icon={<FaUsers className="text-2xl text-sky-600/70" />}
      />

      <CarruselBase
        items={lugares}
        title="Locales"
        icon={<FaStore className="text-2xl text-sky-600/70" />}
      />
    </div>
  );
}