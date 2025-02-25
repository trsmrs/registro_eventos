"use client"
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import db from "@/lib/firebaseConfig";
import { createRef, useEffect, useRef, useState } from "react";

interface EventLists {
    eventName: string;
    eventData: string;
    observations: string;
    slots: string;
}

const LayoutPrincipal = () => {
    const [dados, setDados] = useState<EventLists>({ eventName: '', eventData: '', slots: '', observations: '' });

    async function handleSetData() {
        try {
            // Add a new document with form data
            const docRef = await addDoc(collection(db, 'events'), {
                eventname: dados.eventName || "",
                eventdata: dados.eventData || "",
                slots: dados.slots || null,
                observations: dados.observations || ""
            });
            console.log('Document written with ID: ', docRef.id);
            alert('Dados enviados com sucesso!');

        } catch (e) {
            console.error('Error adding document: ', e);
        }
    };

    return (
        <div className="flex flex-col text-center w-[70%]">
            <h1>Eventos</h1>
            <form action="" >

                <div className="flex flex-col align-center text-center border 1px w-90">
                    <input type="text" placeholder="Digite o Nome Do evento"
                        className="p-3 m-2 text-black uppercase placeholder:text-center"
                        required={true}
                        onChange={(e) => setDados(prevDados => ({ ...prevDados, eventName: e.target.value }))}

                    />
                    <input type="datetime-local"
                        className="p-3 m-2 text-black uppercase text-center"
                        required={true}
                        onChange={(e) => setDados(prevDados => ({ ...prevDados, eventData: e.target.value }))}
                    />
                    <input type="number" placeholder="Digite o número de vagas"
                        className="p-3 m-2 text-black uppercase placeholder:text-center"
                        required={true}
                        onChange={(e) => setDados(prevDados => ({ ...prevDados, slots: e.target.value }))}
                    />
                    <textarea rows={4} placeholder="Observações do evento"
                        className="p-3 m-2 text-black uppercase placeholder:text-center"
                        onChange={(e) => setDados(prevDados => ({ ...prevDados, observations: e.target.value }))}
                    ></textarea>
                    <button className="bg-green-400 m-auto p-1 mt-2 mb-3 rounded text-black"
                        onClick={handleSetData}
                    >Criar Evento</button>
                </div>
            </form>
        </div>

    )
}


export default LayoutPrincipal;