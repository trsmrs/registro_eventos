"use client"
import { getFirestore, collection, addDoc } from "firebase/firestore";
import db from "@/lib/firebaseConfig";
import { useState } from "react";

interface EventLists {
    eventName: string;
    eventData: string;
    observations: string;
    slots: string;
}

const LayoutPrincipal = () => {
    const [dados, setDados] = useState<EventLists>({ eventName: '', eventData: '', slots: '', observations: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [eventId, setEventId] = useState<string | null>(null); // Estado para armazenar o ID do evento

    const handleSetData = async (e: React.FormEvent) => {
        e.preventDefault(); // Previne o comportamento padrão do formulário

        if (isSubmitting) return; // Impede múltiplos envios
        setIsSubmitting(true); // Desabilita o botão

        if (!dados.eventName || !dados.eventData || !dados.slots) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            setIsSubmitting(false); // Reabilita o botão em caso de erro
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'events'), {
                eventname: dados.eventName,
                eventdata: dados.eventData,
                slots: dados.slots,
                observations: dados.observations || ""
            });
            console.log('Document written with ID: ', docRef.id);
            setEventId(docRef.id); // Armazena o ID do evento
            setSuccess(true);
            setError(null);
            setDados({ eventName: '', eventData: '', slots: '', observations: '' }); // Limpa o formulário
        } catch (e) {
            console.error('Error adding document: ', e);
            setError("Ocorreu um erro ao enviar os dados. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col text-center w-[70%]">
            <h1 className="text-2xl font-bold mb-4">Eventos</h1>
            <form onSubmit={handleSetData}>
                <div className="bg-slate-300 shadow-md rounded-lg p-6 mb-4 flex flex-col align-center text-center border border-gray-300 rounded-lg p-4 w-full max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Digite o Nome Do Evento"
                        className="p-3 m-2 text-black uppercase placeholder:text-center text-center border border-gray-300 rounded"
                        required
                        value={dados.eventName}
                        onChange={(e) => setDados(prevDados => ({ ...prevDados, eventName: e.target.value }))}
                    />
                    <input
                        type="datetime-local"
                        className="p-3 m-2 text-black uppercase text-center border border-gray-300 rounded"
                        required
                        value={dados.eventData}
                        onChange={(e) => setDados(prevDados => ({ ...prevDados, eventData: e.target.value }))}
                    />
                    <input
                        type="number"
                        placeholder="Digite o número de vagas"
                        className="p-3 m-2 text-black uppercase placeholder:text-center text-center border border-gray-300 rounded"
                        required
                        value={dados.slots}
                        onChange={(e) => setDados(prevDados => ({ ...prevDados, slots: e.target.value }))}
                    />
                    <textarea
                        rows={4}
                        placeholder="Observações do Evento"
                        className="p-3 m-2 text-black uppercase placeholder:text-center text-center border border-gray-300 rounded"
                        value={dados.observations}
                        onChange={(e) => setDados(prevDados => ({ ...prevDados, observations: e.target.value }))}
                    ></textarea>
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    {success && (
                        <div className="mt-4">
                            <p className="text-green-500 mb-2">Dados enviados com sucesso!</p>
                            <p className="text-black font-bold">ID do Evento: {eventId}</p>
                            <p className="text-sm text-gray-600">Guarde este ID para gerenciar o evento.</p>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-green-400 m-auto p-2 mt-2 mb-3 rounded text-black font-bold hover:bg-green-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isSubmitting} // Desabilita o botão durante o envio
                    >
                        {isSubmitting ? "Enviando..." : "Criar Evento"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LayoutPrincipal;