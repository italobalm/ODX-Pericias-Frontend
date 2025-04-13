"use client";

import { useState, useEffect } from "react";
import { AiOutlineUpload, AiOutlineFileAdd } from "react-icons/ai";

export default function GestaoEvidencias() {
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [casoId, setCasoId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedEvidencia, setSelectedEvidencia] = useState<any>(null);
  const [laudo, setLaudo] = useState("");

  useEffect(() => {
    // Carregar evidências do backend
    fetch("/api/evidencias")
      .then((res) => res.json())
      .then((data) => {
        // Forçar as evidências fictícias a aparecerem sempre
        const ficticias = [
          {
            id: "1",
            casoId: "Caso 001",
            fileUrl: "/uploads/fake-evidence-1.jpg", // Imagem fictícia
            fileType: "image", // Tipo de arquivo para a evidência fictícia
          },
          {
            id: "2",
            casoId: "Caso 002",
            fileUrl: "/uploads/fake-evidence-2.jpg", // Imagem fictícia
            fileType: "image", // Tipo de arquivo para a evidência fictícia
          },
        ];
        setEvidencias([...data, ...ficticias]); // Adiciona as fictícias na lista
      })
      .catch(() => {
        alert("Erro ao carregar evidências.");
        // Adiciona as evidências fictícias caso a API falhe
        const ficticias = [
          {
            id: "1",
            casoId: "Caso 001",
            fileUrl: "/uploads/fake-evidence-1.jpg", // Imagem fictícia
            fileType: "image",
          },
          {
            id: "2",
            casoId: "Caso 002",
            fileUrl: "/uploads/fake-evidence-2.jpg", // Imagem fictícia
            fileType: "image",
          },
        ];
        setEvidencias(ficticias); // Fictícias forçadas
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !casoId) return alert("Preencha todos os campos.");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("casoId", casoId);

    try {
      const res = await fetch("/api/evidencias", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      alert("Evidência salva!");
      setFile(null);
      setCasoId("");
      setShowForm(false);
      const data = await res.json();
      setEvidencias((prev) => [...prev, data]);
    } catch {
      alert("Erro ao salvar evidência.");
    }
  };

  const handleCreateReport = async () => {
    if (!laudo || !selectedEvidencia) {
      return alert("Preencha o laudo.");
    }

    // Lógica para salvar o laudo no banco
    const laudoData = {
      evidenciaId: selectedEvidencia.id,
      laudo,
    };

    try {
      const res = await fetch("/api/laudos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(laudoData),
      });
      if (!res.ok) throw new Error();
      alert("Laudo criado e enviado!");
      setLaudo("");
      setSelectedEvidencia(null); // Limpar a evidência selecionada
    } catch {
      alert("Erro ao salvar o laudo.");
    }
  };

  const handleSelectEvidencia = (evidencia: any) => {
    setSelectedEvidencia(evidencia);
  };

  const renderFilePreview = (evidencia: any) => {
    if (evidencia.fileType === "text") {
      return (
        <div className="text-sm text-gray-600">
          <p>{evidencia.fileUrl}</p>
        </div>
      );
    }
    if (evidencia.fileType === "pdf") {
      return (
        <iframe
          src={evidencia.fileUrl}
          className="w-full h-64 border border-teal-300"
          title={`Preview ${evidencia.id}`}
        />
      );
    }
    return (
      <img
        src={evidencia.fileUrl}
        alt="Pré-visualização"
        className="w-full h-32 object-contain"
      />
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-10 flex flex-col items-center bg-white">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0 sm:text-left">
            Gestão de Evidências
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition w-full sm:w-auto sm:mt-0 mt-4"
          >
            <AiOutlineFileAdd size={20} /> Nova Evidência
          </button>
        </div>

        {showForm && (
          <div className="bg-teal-50 rounded-xl p-4 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Caso associado
              </label>
              <input
                type="text"
                value={casoId}
                onChange={(e) => setCasoId(e.target.value)}
                placeholder="ID do caso"
                className="w-full border border-teal-300 rounded-xl px-4 py-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Arquivo
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm bg-teal-50 border border-teal-300 rounded-xl p-2 file:border-none file:bg-teal-100 file:text-teal-800 file:py-2 file:px-4 transition"
              />
            </div>
            {filePreview && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Pré-visualização:</p>
                <img
                  src={filePreview}
                  alt="Pré-visualização"
                  className="w-full h-32 object-contain"
                />
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl w-full transition"
            >
              Enviar Evidência
            </button>
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {evidencias.length > 0 ? (
            evidencias.map((evidencia: any) => (
              <div
                key={evidencia.id}
                className="border border-teal-300 rounded-xl p-4 shadow-md hover:shadow-lg transition cursor-pointer"
                onClick={() => handleSelectEvidencia(evidencia)}
              >
                <h3 className="font-semibold text-lg text-teal-700">
                  {evidencia.casoId}
                </h3>
                {renderFilePreview(evidencia)}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-2">
              Nenhuma evidência encontrada.
            </p>
          )}
        </div>
      </div>

      {selectedEvidencia && (
        <div className="bg-teal-50 rounded-xl p-6 mt-6 w-full max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Criar Laudo
          </h2>
          <textarea
            value={laudo}
            onChange={(e) => setLaudo(e.target.value)}
            placeholder="Digite o laudo para esta evidência..."
            className="w-full border border-teal-300 rounded-xl px-4 py-2 focus:ring-teal-500 focus:border-teal-500 transition h-48"
          />
          <button
            onClick={handleCreateReport}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl mt-4 w-full transition"
          >
            Enviar Laudo
          </button>
        </div>
      )}
    </div>
  );
}
