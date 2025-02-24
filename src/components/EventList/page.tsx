"use client"
import { collection, doc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import db from "@/lib/firebaseConfig"
import { useEffect, useState } from "react";



interface Participant {
  name: string;
  cpf: string;
}

interface EventLists {
  id: string;
  eventname: string;
  eventdata: string;
  observations: string;
  slots: number;
  disponibleSlots?: number;
  registereds?: number;
  participants: Participant[];

}

const EventList = () => {
  const [data, setData] = useState<EventLists[]>([])
  const [newParticipants, setNewParticipants] = useState<{ [eventId: string]: Participant }>({});

// Carrega os dados iniciais
// useEffect(() => {
//   getData();
// }, []);

  // Escuta mudanças na coleção "events" e atualiza o estado
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (querySnapshot) => {
      const events: EventLists[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const evento: EventLists = {
          id: doc.id,
          eventname: docData.eventname ?? "",
          eventdata: docData.eventdata ?? "",
          observations: docData.observations ?? "",
          slots: docData.slots ?? 0,
          disponibleSlots: docData.disponibleSlots ?? 0,
          registereds: docData.registereds ?? 0,
          participants: docData.participants ?? [],
        };
        events.push(evento);
      });
      setData(events);
    });

    return () => unsubscribe();
  }, []);


// async function getData() {
//   try {
//     const querySnapshot = await getDocs(collection(db, "events"));
//     const events: EventLists[] = [];
//     querySnapshot.forEach((doc) => {
//       const docData = doc.data();
//       const evento: EventLists = {
//         id: doc.id,
//         eventname: docData.eventname ?? "",
//         eventdata: docData.eventdata ?? "",
//         observations: docData.observations ?? "",
//         slots: docData.slots ?? 0,
//         disponibleSlots: docData.disponibleSlots ?? 0,
//         registereds: docData.registereds ?? 0,
//         participants: docData.participants ?? []
//       };
//       events.push(evento);
//     });
//     setData(events);
    
//   } catch (error) {
//     console.error("Error fetching documents: ", error);
//   }
// }



  const handleParticipantChange = (event: React.ChangeEvent<HTMLInputElement>, eventId: string) => {
    let { name, value } = event.target;
   
      if(name === "cpf"){
        value = formatCPF(value);
      }
   
    setNewParticipants(prevParticipants => ({
      ...prevParticipants,
      [eventId]: {
        ...prevParticipants[eventId] || {name: '', cpf: ''},
        [name]: value
      }
    }));

    if(name === "cpf" && value.length ===14){
      const isValid = handleValidCpf(value);
      if(!isValid){
        alert("CPF inválido!")
      }
    }


  }

  const handleAddParticipant = async (eventId: string) => {
    const participant = newParticipants[eventId]
    if(!participant || !participant.cpf.trim()){
      alert("CPF é obrigatório")
      return;
    }
    
    try {
      const eventDoc = doc(db, "events", eventId);
      const evento = data.find((evento) => evento.id === eventId);
      if (evento) {
        const updateParticipants = [...evento.participants, participant]
        await updateDoc(eventDoc, { participants: updateParticipants });
        setData(prevData => prevData.map(evt => evt.id === eventId ? { ...evt, participants: updateParticipants } : evt));
        setNewParticipants(
          prevParticipants => ({
            ...prevParticipants,
            [eventId]: { name: '', cpf: '' }
          })
        );
        alert("Participante adicionado com sucesso!")
      }
    } catch (err) {
      console.error("Erro ao adicionar participante", err)
    }
  }

  const handleValidCpf = (cpf: string): boolean => {

    cpf = cpf.replace(/\D+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0, rest;
    
   //valida os 9 primeiros digits
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.charAt(9))) return false;

    sum = 0;

    //validar os primeiros 10 digt do CPF
    for(let i = 0; i <10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    rest = (sum *10) % 11;
    if(rest === 10 || rest === 11) rest =0;
    if(rest !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

const formatCPF = (cpf: string): string =>{

    cpf= cpf.replace(/\D/g, ""); // remove não numericos
    return cpf
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Event List</h1>
      {data.length === 0 ? (
        <p>No events found.</p>
      ) : (
        data.map((event, index) => (
          <div key={index} className="bg-gray-300 shadow-md rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2">Event Name: {event.eventname}</h2>
            <p className="text-gray-700">Event Data: {event.eventdata}</p>
            <p className="text-gray-700">Observations: {event.observations}</p>
            <p className="text-gray-700">Slots: {event.slots}</p>
            <p className="text-gray-700">Disponible Slots: {event.disponibleSlots}</p>
            <p className="text-gray-700">Registereds: {event.registereds}</p>
            <h3 className="text-lg font-semibold mt-4 text-black">Participantes:</h3>
            {event.participants.map((participant, pIndex) => (
              <p key={pIndex} className="text-black bg-green-300">
                {participant.name}
              </p>
            ))}
            <div className="mt-4 flex flex-col">
              <input
                type="text"
                name="name"
                placeholder="Nome do participante"
                className="p-3 m-2 text-black uppercase placeholder:text-center border 1px border-black"
                value={newParticipants[event.id]?.name || ''}
                onChange={(e) => handleParticipantChange(e, event.id)}
                required={true}
              />
              <input
                type="text"
                name="cpf"
                placeholder="CPF do participante"
                className="p-3 m-2 text-black uppercase placeholder:text-center border 1px border-black"
                value={newParticipants[event.id]?.cpf || ''}
                maxLength={14}
                onChange={(e) => handleParticipantChange(e, event.id)}
    
              />
              <button
                onClick={() => handleAddParticipant(event.id)}
                className="p-2 bg-blue-500 text-white rounded mt-2"
              >
                Adicionar Participante
              </button>
            </div>

          </div>
        ))
      )}
    </div>
  );
}
export default EventList;