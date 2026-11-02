import { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import "./styles/IAagente.css";

const MENSAJE_INICIAL = {
  id: 1,
  role: "assistant",
  text: "¡Hola! Soy el asistente de la panadería. Esta es una demo local: todavía no estoy conectado a un servicio real de IA.",
};

export default function IAgente() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([MENSAJE_INICIAL]);
  const [escuchando, setEscuchando] = useState(false);
  const [aviso, setAviso] = useState("");
  const reconocimientoRef = useRef(null);
  const mensajesEndRef = useRef(null);
  const siguienteIdRef = useRef(2);

  useEffect(() => {
    if (abierto) {
      mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [abierto, mensajes]);

  useEffect(
    () => () => {
      reconocimientoRef.current?.stop();
    },
    [],
  );

  const enviarMensaje = (texto = mensaje) => {
    const textoLimpio = texto.trim();
    if (!textoLimpio) return;

    const idUsuario = siguienteIdRef.current++;
    setMensajes((actuales) => [
      ...actuales,
      { id: idUsuario, role: "user", text: textoLimpio },
    ]);
    setMensaje("");
    setAviso("");
    reconocimientoRef.current?.stop();

    window.setTimeout(() => {
      setMensajes((actuales) => [
        ...actuales,
        {
          id: siguienteIdRef.current++,
          role: "assistant",
          text: "Gracias por tu mensaje. Esta respuesta es parte de la demo: para recibir respuestas reales, hay que conectar el chat con un servicio de IA.",
        },
      ]);
    }, 450);
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    enviarMensaje();
  };

  const alternarMicrofono = () => {
    if (escuchando) {
      reconocimientoRef.current?.stop();
      return;
    }

    const ReconocimientoVoz =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!ReconocimientoVoz) {
      setAviso("Este navegador no admite el reconocimiento de voz.");
      return;
    }

    const reconocimiento = new ReconocimientoVoz();
    reconocimiento.lang = "es-AR";
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;
    reconocimiento.onstart = () => {
      setEscuchando(true);
      setAviso("Te escucho…");
    };
    reconocimiento.onresult = (evento) => {
      const transcripcion = evento.results[0][0].transcript.trim();
      if (transcripcion) enviarMensaje(transcripcion);
    };
    reconocimiento.onerror = (evento) => {
      setEscuchando(false);
      if (evento.error !== "aborted") {
        setAviso("No se pudo reconocer la voz. Puedes intentarlo de nuevo.");
      }
    };
    reconocimiento.onend = () => {
      setEscuchando(false);
      reconocimientoRef.current = null;
    };
    reconocimientoRef.current = reconocimiento;

    try {
      reconocimiento.start();
    } catch {
      reconocimientoRef.current = null;
      setEscuchando(false);
      setAviso("No se pudo iniciar el micrófono. Revisa los permisos del navegador.");
    }
  };

  const cerrarChat = () => {
    reconocimientoRef.current?.stop();
    setAbierto(false);
  };

  return (
    <div className="ia-widget">
      {abierto && (
        <section
          className="ia-chat"
          role="dialog"
          aria-modal="false"
          aria-labelledby="ia-titulo"
        >
          <header className="ia-chat-header">
            <div className="ia-avatar">
              <Bot size={21} aria-hidden="true" />
            </div>
            <div className="ia-chat-heading">
              <h2 id="ia-titulo">Asistente de panadería</h2>
              <span>
                <Sparkles size={13} aria-hidden="true" />
                Demo local
              </span>
            </div>
            <button
              type="button"
              className="ia-icon-button ia-close-button"
              onClick={cerrarChat}
              aria-label="Cerrar chat"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="ia-messages" role="log" aria-live="polite">
            {mensajes.map((item) => (
              <div
                className={`ia-message ia-message-${item.role}`}
                key={item.id}
              >
                {item.role === "assistant" && (
                  <span className="ia-message-avatar">
                    <Bot size={15} aria-hidden="true" />
                  </span>
                )}
                <p>{item.text}</p>
              </div>
            ))}
            <div ref={mensajesEndRef} />
          </div>

          <form className="ia-composer" onSubmit={manejarEnvio}>
            {aviso && (
              <p className="ia-notice" role="status">
                {aviso}
              </p>
            )}
            <div className="ia-input-row">
              <textarea
                value={mensaje}
                onChange={(evento) => setMensaje(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" && !evento.shiftKey) {
                    evento.preventDefault();
                    enviarMensaje();
                  }
                }}
                placeholder="Escribe tu mensaje…"
                aria-label="Escribe tu mensaje"
                rows={1}
              />
              <button
                type="button"
                className={`ia-icon-button ia-mic-button${escuchando ? " is-listening" : ""}`}
                onClick={alternarMicrofono}
                aria-label={escuchando ? "Detener micrófono" : "Hablar"}
                aria-pressed={escuchando}
                title={escuchando ? "Detener micrófono" : "Hablar"}
              >
                {escuchando ? (
                  <MicOff size={19} aria-hidden="true" />
                ) : (
                  <Mic size={19} aria-hidden="true" />
                )}
              </button>
              <button
                type="submit"
                className="ia-send-button"
                aria-label="Enviar mensaje"
                disabled={!mensaje.trim()}
              >
                <Send size={17} aria-hidden="true" />
              </button>
            </div>
            <span className="ia-footnote">
              La demo no envía tus mensajes a un servicio de IA.
            </span>
          </form>
        </section>
      )}

      {!abierto && (
        <button
          type="button"
          className="ia-launcher"
          onClick={() => setAbierto(true)}
          aria-label="Abrir chat con el asistente de IA"
        >
          <MessageCircle size={23} aria-hidden="true" />
          <span>Hablar con IA</span>
        </button>
      )}
    </div>
  );
}