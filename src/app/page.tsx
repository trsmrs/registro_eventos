
import EventList from "@/components/EventList/page";
import LayoutPrincipal from "@/components/PaginaInicial/page";
import Image from "next/image";


export default function Home() {


  return (
    <div className="flex flex-col w-full border 1px justify-center items-center p-9">
      <LayoutPrincipal />
      <div className="pt-10">
        <EventList />
      </div>
    </div>
  );
}
