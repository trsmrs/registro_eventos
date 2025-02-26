
import EventList from "@/components/EventList/page";
import LayoutPrincipal from "@/components/PaginaInicial/page";



export default function Home() {


  return (
    <div className="bg-slate-500 shadow-md rounded-lg p-6 mb-4 flex flex-col w-full justify-center items-center border mx-auto">
      <LayoutPrincipal />
      <EventList />
    </div>
  );
}
