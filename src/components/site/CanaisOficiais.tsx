import { MessageCircle } from "lucide-react";
import { Botao } from "@/components/ui/Botao";
import { EVENTO, whatsappLink } from "@/data/evento";
import { getEstande, rotuloEstande } from "@/data/planta";

/**
 * Exibido em produção no lugar dos formulários de demonstração:
 * enquanto não houver backend seguro (persistência, autenticação, LGPD), nenhum dado pessoal é coletado no site.
 */
export default function CanaisOficiais({ tipo, estandeId }: { tipo: "expositor" | "visitante"; estandeId?: string }) {
  const estande = getEstande(estandeId);
  const mensagem =
    tipo === "expositor"
      ? `Olá, quero participar do Mega Fashion!${estande ? ` Tenho interesse no espaço ${estande.numero} (${estande.dimensao.replace("x", " × ")} m) da planta.` : ""}`
      : "Olá! Gostaria de informações para visitar o Mega Fashion Outlet.";

  return (
    <div className="rounded-[28px] border border-line bg-paper p-6 sm:p-10" role="region" aria-labelledby="canais-titulo">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-deep">Atendimento oficial</p>
      <h2 id="canais-titulo" className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
        {tipo === "expositor" ? "Fale com a organização para expor." : "Informações para a sua visita."}
      </h2>

      {estande && (
        <div className="mt-6 rounded-2xl border border-line bg-ivory p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Espaço escolhido no mapa</p>
          <p className="mt-1 font-semibold">{rotuloEstande(estande)}</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            O número já vai na mensagem. A disponibilidade é confirmada exclusivamente pela organização.
          </p>
        </div>
      )}

      <p className="mt-6 text-[15px] leading-7 text-muted">
        {tipo === "expositor"
          ? "As inscrições de expositores são tratadas diretamente pela organização. Valores, disponibilidade e condições são informados no atendimento."
          : `${EVENTO.datas.rotulo}, das ${EVENTO.horario}, no ${EVENTO.local.nome}. Para dúvidas sobre entrada e serviços, consulte a organização.`}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {tipo === "expositor" && (
          <Botao href={whatsappLink(EVENTO.whatsappExpositores[0], mensagem)} externo icone="diagonal">
            <span className="inline-flex items-center gap-2">
              <MessageCircle aria-hidden className="size-4" /> Falar no WhatsApp
            </span>
          </Botao>
        )}
        <Botao href={EVENTO.linktree} externo icone="diagonal" variante={tipo === "expositor" ? "secundario" : "primario"}>
          Canais oficiais
        </Botao>
        <Botao href={EVENTO.instagram.url} externo icone="diagonal" variante="secundario">
          Instagram
        </Botao>
      </div>

      <p className="mt-6 text-xs leading-5 text-muted">
        Contatos publicados no Linktree oficial do evento. Este site não coleta dados pessoais.
      </p>
    </div>
  );
}
