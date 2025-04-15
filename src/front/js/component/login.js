import React from "react";
import { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { store, actions } = useContext(Context);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Por favor complete todos los campos");
      return;
    }
    try {
      const status = await actions.login({
        email: username,
        contraseña: password,
      });

      if (status) {
        const lastRoute =
          sessionStorage.getItem("lastRoute") || "/dashboard/inicio";
        sessionStorage.removeItem("lastRoute");
        navigate(lastRoute);
        if (
          store.authdata.rol === "ceo" ||
          store.authdata.autoridades.rol === "ceo"
        ) {
          const lastRoute =
            sessionStorage.getItem("lastRoute") || "/dashboard/global";
          sessionStorage.removeItem("lastRoute");
          navigate(lastRoute);
        } else {
          const lastRoute =
            sessionStorage.getItem("lastRoute") || "/dashboard/inicio";
          sessionStorage.removeItem("lastRoute");
          navigate(lastRoute);
        }
      } else {
        console.log("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Error al intentar iniciar sesión");
    }
  };

  return (
    <div
      className="backdrop-blur-sm bg-white/10 dark:bg-black/10 
                        rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                        border border-gray-200/20"
    >
      <h2
        className="text-2xl font-bold text-gray-800 dark:text-white mb-6 
                         text-center"
      >
        Iniciar Sesión
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 
                                    dark:text-gray-200"
          >
            Correo electrónico
          </label>
          <input
            type="email"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border 
                                 border-gray-300 dark:border-gray-600
                                 bg-white/50 dark:bg-gray-800/50
                                 focus:ring-2 focus:ring-lime-500 
                                 focus:border-lime-500
                                 dark:text-white
                                 placeholder-gray-400
                                 backdrop-blur-sm"
            placeholder="usuario@email.com"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 
                                    dark:text-gray-200"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border 
                                 border-gray-300 dark:border-gray-600
                                 bg-white/50 dark:bg-gray-800/50
                                 focus:ring-2 focus:ring-lime-500 
                                 focus:border-lime-500
                                 dark:text-white
                                 placeholder-gray-400
                                 backdrop-blur-sm"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-lime-600 
                             hover:bg-lime-700 text-white font-semibold 
                             rounded-lg shadow-md hover:shadow-lg 
                             transition duration-300 ease-in-out
                             focus:outline-none focus:ring-2 
                             focus:ring-lime-500 focus:ring-opacity-75"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default Login;