
import { getProfilesPublic } from '../actions/actions';
import CarruselBase from './CarruselBase';
import { FaUser, FaUsers, FaStore } from 'react-icons/fa';

export default async function PerfilesComponent() {
  // Traemos la data real
  const profiles = await getProfilesPublic();

  // Filtramos y mapeamos la data
  const artistas = profiles
    .filter(profile => profile.type === 'artist')
    .map(profile => ({
      id: profile.id,
      name: (profile.data as any).name || 'Artista',
      imageUrl: (profile.data as any).image_url,
      fallbackIcon: <FaUser />,
      type:'artista'
    }));

  const bandas = profiles
    .filter(profile => profile.type === 'band')
    .map(profile => ({
      id: profile.id,
      name: (profile.data as any).band_name || 'Banda',
      imageUrl: (profile.data as any).photo_url,
      fallbackIcon: <FaUsers />,
      type:'banda'
    }));

  const lugares = profiles
    .filter(profile => profile.type === 'place')
    .map(profile => ({
      id: profile.id,
      name: (profile.data as any).place_name || 'Local',
      imageUrl: (profile.data as any).photo_url,
      fallbackIcon: <FaStore />,
      type:'lugar'
    }));

    //console.log('lugares ',lugares)

  return (
    <div className=" max-w-screen space-y-12">
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