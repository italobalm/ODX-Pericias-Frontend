"use client";

import { useRouter } from "next/navigation";
import { FaFileAlt, FaFileMedical, FaClipboardList, FaLink, FaCog, FaSignOutAlt } from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();
  const userFullName = "Italo Melo"; // Nome temporário para visualização
  const croNumber = "123456"; // Número temporário do CRO
  //const [userFullName, setUserFullName] = useState("");
  // const [croNumber, setCroNumber] = useState("");

  const menuItems = [
    { title: "Nova Ocorrência", icon: <FaFileAlt />, path: "/nova-ocorrencia" },
    { title: "Laudos", icon: <FaClipboardList />, path: "/laudos" },
    { title: "Conectar Casos", icon: <FaLink />, path: "/conectar-casos" },
    { title: "Minhas Perícias", icon: <FaFileMedical  />, path: "/minhas-pericias" }, // Novo item
  ];
  

  //useEffect(() => {
    //const storedName = localStorage.getItem("name");
    //const storedCro = localStorage.getItem("cro");
    
    //if (storedName) setUserFullName(storedName);
  //  if (storedCro) setCroNumber(storedCro);
  //}, []);

  // <h2 className="text-lg font-semibold text-gray-800">{userFullName || "Nome do Usuário"}</h2>
  // <span className="text-sm text-gray-600">{`CRO: ${croNumber || "Número do CRO"}`}</span>

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      {/* Navbar */}
      <header className="w-full max-w-md flex justify-between items-center py-4 px-6 bg-transparent shadow-md rounded-b-3xl fixed top-0 left-0 z-10">
        {/* Informações do usuário */}
        <div className="flex flex-col items-start space-y-1">
          <h2 className="text-lg font-semibold text-gray-800">{userFullName}</h2>
          <span className="text-sm text-gray-600">{`CRO: ${croNumber}`}</span>
        </div>

        {/* Botão de configurações */}
        <div
          className="p-2  transition cursor-pointer"
          onClick={() => router.push("/configuracoes")}
        >
          <FaCog className="text-black text-2xl" />
        </div>
      </header>

      {/* Itens de menu */}
      <div className="text-lg font-semibold text-gray-800 ">
        <h1>O que deseja fazer?</h1>
      </div>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md mt-24">
  {menuItems.map((item, index) => (
    <button
      key={index}
      onClick={() => router.push(item.path)}
      className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-lg hover:bg-gray-200 transition w-full border-2 border-gray-300"
    >
      <span className="text-4xl text-teal-500">{item.icon}</span>
      <span className="mt-2 text-lg font-semibold text-gray-800">
        {item.title}
      </span>
    </button>
  ))} 
</div>
      {/* Botão de sair no canto inferior direito */}
      <div className="absolute bottom-6 right-6">
        <button
          onClick={() => router.push("http://localhost:3000/")} // ou outra página de logout
          className="flex items-center justify-center bg-red-700 text-white p-3 rounded-full shadow-lg hover:bg-red-400 transition"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </div>
  );
}
