import Image from "next/image";
import QuienesSomos from "./components/QuiesesSomos";
import HeroSlider from "./components/HeroSlider";
import Footer from "./components/Footer";
import AllLocationsMap from "./components/MultipleLocationMap";
import PerfilesCarruseles from "./components/PerfilesCarruseles";
import EventosCarrusel from "./components/EventosCarrusel";
import PermisoUbicacion from "./components/PermisoUbicacion";
import LugareCercanosMap from "./components/MultipleLocationMap";

export default function Home() {

 
  
  
  
  return (
  <div className="bg-neutral-950 w-full overflow-x-hidden h-full flex flex-col items-center justify-center gap-5 custom-scrollbar">
  {/* Modal de permisos - Client Component */}
      <PermisoUbicacion />

<section id="HeroSlider" className="w-full h-full flex ">
    <HeroSlider />

</section>
<section>
  <LugareCercanosMap/>
</section>
<section className="max-w-screen flex items-center justify-center">
  <PerfilesCarruseles/>
</section>
<section className="max-w-screen flex items-center justify-center">
    <EventosCarrusel/>
</section>
<section id="QuienesSomos" className="w-full h-full flex ">
  <QuienesSomos />

</section>

<section  id="Footer" className="w-full h-full flex ">

    <Footer />
</section>

  </div>
  );
}
