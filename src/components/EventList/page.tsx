"use client"
import { collection, doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import db from "@/lib/firebaseConfig";
import { useEffect, useState } from "react";
import { FaWheelchair } from "react-icons/fa"; // Ícone de PCD
import { ToastContainer, toast } from "react-toastify"; // Componente e função do react-toastify
import "react-toastify/dist/ReactToastify.css"; // Estilos do react-toastify

interface Participant {
  name: string;
  cpf: string;
  pcd: boolean;
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
  const [data, setData] = useState<EventLists[]>([]);
  const [loading, setLoading] = useState(true);
  const [newParticipants, setNewParticipants] = useState<{ [eventId: string]: Participant }>({});
  const [eventIdToDelete, setEventIdToDelete] = useState<string>(""); // Estado para armazenar o ID do evento fornecido pelo usuário
  const [participantToDelete, setParticipantToDelete] = useState<{ eventId: string; cpf: string } | null>(null); // Estado para armazenar o participante a ser excluído
  const [eventToDelete, setEventToDelete] = useState<{ eventId: string } | null>(null); // Estado para armazenar o evento a ser excluído
  const [showModal, setShowModal] = useState(false); // Estado para controlar a exibição do modal
  const [modalType, setModalType] = useState<"participant" | "event">("participant"); // Estado para diferenciar o tipo de exclusão

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (querySnapshot) => {
      const events: EventLists[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const registeredCount = docData.participants?.length || 0;
        const evento: EventLists = {
          id: doc.id,
          eventname: docData.eventname ?? "",
          eventdata: docData.eventdata ?? "",
          observations: docData.observations ?? "",
          slots: docData.slots ?? 0,
          disponibleSlots: docData.slots - registeredCount,
          registereds: registeredCount,
          participants: docData.participants ?? [],
        };
        events.push(evento);
      });
      setData(events);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleParticipantChange = (event: React.ChangeEvent<HTMLInputElement>, eventId: string) => {
    let { name, value, type, checked } = event.target;

    if (name === "cpf") {
      value = formatCPF(value);
    }

    setNewParticipants(prevParticipants => ({
      ...prevParticipants,
      [eventId]: {
        ...prevParticipants[eventId] || { name: '', cpf: '', pcd: false },
        [name]: type === "checkbox" ? checked : value // Trata checkbox
      }
    }));

    if (name === "cpf" && value.length === 14) {
      const isValid = validateCPF(value);
      if (!isValid) {
        toast.error("CPF inválido!"); // Toast de erro
      }
    }
  };

  const handleAddParticipant = async (eventId: string) => {
    const participant = newParticipants[eventId];

    if (!participant || !participant.cpf.trim()) {
      toast.error("CPF é obrigatório"); // Toast de erro
      return;
    }

    try {
      const eventDoc = doc(db, "events", eventId);
      const evento = data.find((evento) => evento.id === eventId);

      if (evento) {
        if (evento.disponibleSlots !== undefined && evento.disponibleSlots > 0) {
          const isParticipantAlreadyRegistered = evento.participants.some(p => p.cpf === participant.cpf);
          if (isParticipantAlreadyRegistered) {
            toast.error("Participante já registrado!"); // Toast de erro
            return;
          }

          const updatedParticipants = [...evento.participants, participant];
          const updatedDisponibleSlots = evento.disponibleSlots - 1;

          await updateDoc(eventDoc, {
            participants: updatedParticipants,
            disponibleSlots: updatedDisponibleSlots,
          });

          setNewParticipants(prevParticipants => ({
            ...prevParticipants,
            [eventId]: { name: "", cpf: "", pcd: false }
          }));

          toast.success("Participante adicionado com sucesso!"); // Toast de sucesso
        } else {
          toast.error("Não há vagas disponíveis!"); // Toast de erro
        }
      }
    } catch (err) {
      console.error("Erro ao adicionar participante", err);
      toast.error("Ocorreu um erro ao adicionar o participante."); // Toast de erro
    }
  };

  const handleDeleteParticipant = async () => {
    if (!participantToDelete || !eventIdToDelete || eventIdToDelete !== participantToDelete.eventId) {
      toast.error("ID do evento incorreto. Forneça o ID correto para excluir."); // Toast de erro
      return;
    }

    try {
      const eventDoc = doc(db, "events", participantToDelete.eventId);
      const evento = data.find((evento) => evento.id === participantToDelete.eventId);

      if (evento) {
        const updatedParticipants = evento.participants.filter((p) => p.cpf !== participantToDelete.cpf);
        await updateDoc(eventDoc, {
          participants: updatedParticipants,
          disponibleSlots: evento.disponibleSlots?? + 1, // Libera uma vaga
        });

        toast.success("Participante excluído com sucesso!"); // Toast de sucesso
        setParticipantToDelete(null); // Limpa o estado
        setEventIdToDelete(""); // Limpa o campo do ID
        setShowModal(false); // Fecha o modal
      }
    } catch (err) {
      console.error("Erro ao excluir participante", err);
      toast.error("Ocorreu um erro ao excluir o participante."); // Toast de erro
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || !eventIdToDelete || eventIdToDelete !== eventToDelete.eventId) {
      toast.error("ID do evento incorreto. Forneça o ID correto para excluir."); // Toast de erro
      return;
    }

    try {
      await deleteDoc(doc(db, "events", eventToDelete.eventId));
      toast.success("Evento excluído com sucesso!"); // Toast de sucesso
      setEventToDelete(null); // Limpa o estado
      setEventIdToDelete(""); // Limpa o campo do ID
      setShowModal(false); // Fecha o modal
    } catch (err) {
      console.error("Erro ao excluir evento", err);
      toast.error("Ocorreu um erro ao excluir o evento."); // Toast de erro
    }
  };

  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0, rest;

    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.charAt(9))) return false;

    sum = 0;

    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const formatCPF = (cpf: string): string => {
    cpf = cpf.replace(/\D/g, "");
    return cpf
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 text-center">Eventos Registrados</h1>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>Nenhum evento encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {data.map((event, index) => (
            <div key={index} className="bg-slate-100 shadow-md rounded-lg p-4">
              <div className="bg-gray-50 border border-gray-300 rounded-lg shadow-md p-4">
                <h2 className="text-xl mb-2 text-black text-center font-bold">Evento: {event.eventname}</h2>
                <p className="bg-yellow-300 text-yellow-900 font-bold px-2 py-1 rounded-md text-sm">Data: {new Date(event.eventdata).toLocaleString()}</p>
                <p className="text-black font-bold px-2 py-1 rounded-md text-sm mb-2">Observações: {event.observations}</p>
                <p className="text-black font-bold px-2 py-1 rounded-md text-sm mb-2">Vagas: {event.slots}</p>
                <p className={(event.disponibleSlots ?? 0) < 5 ? "text-red-700 font-bold px-2 py-1 rounded-md text-sm mb-2" : "text-black font-bold px-2 py-1 rounded-md text-sm mb-2"}>
                  Vagas Disponíveis: {event.disponibleSlots}
                </p>
                <p className="text-black font-bold px-2 py-1 rounded-md text-sm">Registrados: {event.registereds}</p>
              </div>
              <h3 className="text-lg font-bold px-2 py-1 rounded-md mt-4 text-black">Participantes:</h3>

              <div className={(event.participants.length ?? 0) > 0 ? "bg-green-100 border border-green-400 rounded-md p-2" : ""}>
                {event.participants.map((participant, pIndex) => (
                  <div key={pIndex} className="text-black m-1 mx-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm">{participant.name}</span>
                      {participant.pcd && <FaWheelchair className="ml-2 text-blue-500" />} {/* Ícone de PCD */}
                    </div>
                    <button
                      onClick={() => {
                        setParticipantToDelete({ eventId: event.id, cpf: participant.cpf });
                        setModalType("participant");
                        setShowModal(true);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulário para adicionar participantes */}
              <div className="mt-4 flex flex-col">
                <input
                  type="text"
                  name="name"
                  placeholder="Nome do participante"
                  className="bg-gray-200 text-gray-500 border border-gray-300 rounded-md px-3 py-2 mb-2 text-sm"
                  value={newParticipants[event.id]?.name || ''}
                  onChange={(e) => handleParticipantChange(e, event.id)}
                  required={true}
                />
                <input
                  type="text"
                  name="cpf"
                  placeholder="CPF do participante"
                  className="bg-gray-200 text-gray-500 border border-gray-300 rounded-md px-3 py-2 mb-2 text-sm"
                  value={newParticipants[event.id]?.cpf || ''}
                  maxLength={14}
                  onChange={(e) => handleParticipantChange(e, event.id)}
                />
                <div className="flex items-center mb-2">
                  <label className="text-black mr-2 text-sm">PCD?</label>
                  <input
                    type="checkbox"
                    name="pcd"
                    checked={newParticipants[event.id]?.pcd || false}
                    onChange={(e) => handleParticipantChange(e, event.id)}
                  />
                </div>
                <button
                  onClick={() => handleAddParticipant(event.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all text-sm"
                >
                  Adicionar Participante
                </button>

                <button
                  onClick={() => {
                    setEventToDelete({ eventId: event.id });
                    setModalType("event");
                    setShowModal(true);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md mt-2 text-sm"
                >
                  Excluir Evento
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para confirmar exclusão */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
            <p className="mb-4 text-sm">Digite o ID do evento para confirmar a exclusão:</p>
            <input
              type="text"
              placeholder="ID do Evento"
              className="bg-gray-200 text-gray-500 border border-gray-300 rounded-md px-3 py-2 mb-4 w-full text-sm"
              value={eventIdToDelete}
              onChange={(e) => setEventIdToDelete(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow-md mr-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={modalType === "participant" ? handleDeleteParticipant : handleDeleteEvent}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ToastContainer para exibir as notificações */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default EventList;