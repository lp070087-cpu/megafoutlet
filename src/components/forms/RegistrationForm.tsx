"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Botao } from "@/components/ui/Botao";
import { EVENTO, whatsappLink } from "@/data/evento";
import { getEstande, rotuloEstande } from "@/data/planta";
import {
  confirmarVisitante,
  criarLojista,
  listarLojistas,
  listarVisitantes,
} from "@/lib/demo-store";
import { CATEGORIAS, DIMENSOES_ESTANDE } from "@/lib/types";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
const phone = (value: string) => /^\d{10,11}$/.test(value.replace(/\D/g, ""));
const required = z.string().trim()
  .min(2, "Preencha este campo com pelo menos 2 caracteres.")
  .max(200, "Use no máximo 200 caracteres.");
const consent = z.literal("on", {
  error: "É necessário consentir para continuar.",
}).transform(() => true as const);

const exhibitorSchema = z.object({
  responsavel: required,
  marca: required,
  whatsapp: z.string()
    .refine(phone, "Informe um WhatsApp com DDD (10 ou 11 dígitos).")
    .transform(value => value.replace(/\D/g, "")),
  email: z.email("Informe um e-mail válido.").max(254),
  instagram: z.string().trim().max(200, "Use no máximo 200 caracteres."),
  categoria: z.enum(CATEGORIAS, { error: "Selecione uma categoria." }),
  cidade: required,
  uf: z.string().refine(value => UFS.includes(value), "Selecione a UF."),
  dimensao: z.enum(DIMENSOES_ESTANDE, { error: "Selecione a dimensão desejada." }),
  observacoes: z.string().trim().max(2000, "Use no máximo 2.000 caracteres."),
  consentimento: consent,
});

const visitorSchema = z.object({
  nome: required,
  contato: z.string().trim().max(254).refine(
    value => z.email().safeParse(value).success
      || (/^[\d ()+\-]+$/.test(value) && phone(value)),
    "Informe um e-mail válido ou WhatsApp com DDD (10 ou 11 dígitos). No telefone, use apenas números, espaços, parênteses, hífen e +.",
  ),
  consentimento: consent,
});

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-line bg-paper px-3 py-3 text-base text-ink outline-offset-2 transition-colors focus:border-rose aria-invalid:border-danger";
const submitClass =
  "mt-7 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-rose px-7 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-rose-deep motion-reduce:transition-none";

type FormMode = "expositor" | "visitante";
type FormResult = "success" | "duplicate";
type FormErrors = Record<string, string>;
type FieldAttributes = (name: string) => {
  id: string;
  name: string;
  className: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

export function maskWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  const rest = digits.slice(2);
  const split = digits.length > 10 ? 5 : 4;
  return `(${digits.slice(0, 2)}) ${rest.slice(0, split)}${rest.length > split ? `-${rest.slice(split)}` : ""}`;
}

function Field({
  name,
  label,
  errors,
  children,
  optional = false,
}: {
  name: string;
  label: string;
  errors: FormErrors;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> (opcional)</span>}
      </label>
      {children}
      {errors[name] && (
        <p id={`${name}-error`} className="mt-2 text-sm text-danger">
          {errors[name]}
        </p>
      )}
    </div>
  );
}

function Confirmacao({
  exhibitor,
  result,
  containerRef,
}: {
  exhibitor: boolean;
  result: FormResult;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const title = exhibitor
    ? "Recebemos seu interesse."
    : result === "duplicate"
      ? "Você já confirmou presença"
      : "Sua intenção de comparecer foi registrada.";

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="status"
      className="rounded-2xl border border-line bg-paper p-6 sm:p-10"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-deep">
        {exhibitor ? "Interesse registrado na demonstração" : "Presença na demonstração"}
      </p>
      <h2 className="mt-5 font-display text-4xl tracking-tight">{title}</h2>
      <p className="mt-6 text-lg font-semibold">
        {exhibitor
          ? "Isso NÃO garante reserva de estande."
          : "Esta confirmação é uma intenção de comparecer. Não é ingresso."}
      </p>
      <p className="mt-4 text-sm leading-7 text-muted">
        Ambiente de demonstração: os dados ficam somente neste navegador.{" "}
        {exhibitor
          ? "O cadastro não foi enviado à organização. Entre em contato pelo canal oficial para continuar."
          : "O cadastro não foi enviado à organização. Consulte os canais oficiais para informações sobre a entrada."}
      </p>
      {exhibitor ? (
        <>
          <Botao
            href={whatsappLink(EVENTO.whatsappExpositores[0])}
            externo
            icone="diagonal"
            className="mt-7 py-3 text-center"
          >
            Falar com a organização no WhatsApp
          </Botao>
          <p className="mt-3 text-xs leading-6 text-muted">
            Contato publicado no Linktree oficial de edição anterior.
            Confirme a vigência com a organização.
          </p>
        </>
      ) : (
        <Botao
          href={EVENTO.instagram.url}
          externo
          variante="secundario"
          icone="diagonal"
          className="mt-6"
        >
          Instagram oficial
        </Botao>
      )}
      <Link href="/" className="mt-5 flex min-h-11 items-center text-sm underline">
        Voltar ao evento
      </Link>
    </div>
  );
}

function CamposExpositor({
  errors,
  attrs,
  standDimension,
}: {
  errors: FormErrors;
  attrs: FieldAttributes;
  standDimension?: string;
}) {
  const defaultDimension = standDimension
    && (DIMENSOES_ESTANDE as readonly string[]).includes(standDimension)
    ? standDimension
    : "";

  return (
    <>
      <Field name="responsavel" label="Nome do responsável" errors={errors}>
        <input
          {...attrs("responsavel")}
          autoComplete="name"
          required
          maxLength={200}
        />
      </Field>
      <Field name="marca" label="Marca / nome da loja" errors={errors}>
        <input
          {...attrs("marca")}
          autoComplete="organization"
          required
          maxLength={200}
        />
      </Field>
      <Field name="whatsapp" label="WhatsApp com DDD" errors={errors}>
        <input
          {...attrs("whatsapp")}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(81) 99999-9999"
          required
          maxLength={15}
          onChange={event => {
            event.currentTarget.value = maskWhatsApp(event.currentTarget.value);
          }}
        />
      </Field>
      <Field name="email" label="E-mail" errors={errors}>
        <input
          {...attrs("email")}
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </Field>
      <Field name="instagram" label="Instagram" errors={errors} optional>
        <input
          {...attrs("instagram")}
          placeholder="@suamarca"
          maxLength={200}
          autoCapitalize="none"
        />
      </Field>
      <Field name="categoria" label="Categoria" errors={errors}>
        <select {...attrs("categoria")} required defaultValue="">
          <option value="" disabled>Selecione</option>
          {CATEGORIAS.map(value => <option key={value}>{value}</option>)}
        </select>
      </Field>
      <Field name="cidade" label="Cidade" errors={errors}>
        <input
          {...attrs("cidade")}
          autoComplete="address-level2"
          required
          maxLength={200}
        />
      </Field>
      <Field name="uf" label="UF" errors={errors}>
        <select
          {...attrs("uf")}
          autoComplete="address-level1"
          required
          defaultValue=""
        >
          <option value="" disabled>Selecione</option>
          {UFS.map(value => <option key={value}>{value}</option>)}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field name="dimensao" label="Dimensão desejada" errors={errors}>
          <select {...attrs("dimensao")} required defaultValue={defaultDimension}>
            <option value="" disabled>Selecione</option>
            {DIMENSOES_ESTANDE.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field name="observacoes" label="Observações" errors={errors} optional>
          <textarea {...attrs("observacoes")} rows={4} maxLength={2000} />
        </Field>
      </div>
    </>
  );
}

function CamposVisitante({ errors, attrs }: {
  errors: FormErrors;
  attrs: FieldAttributes;
}) {
  return (
    <>
      <div className="sm:col-span-2">
        <Field name="nome" label="Seu nome" errors={errors}>
          <input {...attrs("nome")} autoComplete="name" required maxLength={200} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field name="contato" label="WhatsApp com DDD ou e-mail" errors={errors}>
          <input
            {...attrs("contato")}
            required
            maxLength={254}
            placeholder="(81) 99999-9999 ou seu@email.com"
            autoCapitalize="none"
          />
        </Field>
      </div>
    </>
  );
}

function RegistrationForm({ mode, standId }: {
  mode: FormMode;
  standId?: string | null;
}) {
  const exhibitor = mode === "expositor";
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<FormResult | null>(null);
  const [failure, setFailure] = useState("");
  const [removedStand, setRemovedStand] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const stand = standId && removedStand !== standId ? getEstande(standId) : undefined;
  const unknownStand = !!standId && removedStand !== standId && !stand;
  const attrs: FieldAttributes = name => ({
    id: name,
    name,
    className: inputClass,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  function focusFirst(name: string) {
    requestAnimationFrame(() => {
      const field = formRef.current?.elements.namedItem(name);
      if (field instanceof HTMLElement) field.focus();
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = exhibitor
      ? exhibitorSchema.safeParse(values)
      : visitorSchema.safeParse(values);

    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0]);
        if (!next[name]) next[name] = issue.message;
      }
      setErrors(next);
      focusFirst(Object.keys(next)[0]);
      return;
    }

    setErrors({});
    try {
      if (exhibitor) {
        const data = exhibitorSchema.parse(values);
        const saved = criarLojista({ ...data, estandeInteresse: stand?.id });
        if (!listarLojistas().some(item => item.id === saved.id)) {
          throw new Error("storage");
        }
        setResult("success");
      } else {
        const data = visitorSchema.parse(values);
        const saved = confirmarVisitante(data.nome, data.contato);
        if (!listarVisitantes().some(item => item.id === saved.visitante.id)) {
          throw new Error("storage");
        }
        setResult(saved.duplicado ? "duplicate" : "success");
      }
      requestAnimationFrame(() => confirmationRef.current?.focus());
    } catch {
      setFailure(
        "Não foi possível salvar neste navegador. Verifique se o armazenamento local está permitido ou consulte a organização pelos canais oficiais.",
      );
    }
  }

  if (result) {
    return (
      <Confirmacao
        exhibitor={exhibitor}
        result={result}
        containerRef={confirmationRef}
      />
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-line bg-paper p-5 sm:p-8"
    >
      <p className="mb-8 border-b border-line pb-5 text-xs leading-6 text-muted">
        Ambiente de demonstração. Os dados serão salvos somente neste navegador
        e não serão enviados à organização. Evite inserir dados pessoais reais neste teste.
      </p>
      {(stand || unknownStand) && (
        <div className="mb-7 rounded-xl border border-line bg-ivory p-4">
          <p className="text-sm font-semibold">
            {stand ? rotuloEstande(stand) : "Espaço não encontrado na planta atual"}
          </p>
          <p className="mt-2 text-xs leading-6 text-muted">
            {stand
              ? "Espaço de interesse. A disponibilidade é confirmada exclusivamente pela organização."
              : "Você pode continuar sem selecionar um estande ou consultar a organização."}
          </p>
          <button
            type="button"
            className="mt-2 min-h-11 text-sm text-rose-deep underline"
            onClick={() => setRemovedStand(standId ?? null)}
          >
            Remover seleção
          </button>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        {exhibitor ? (
          <CamposExpositor errors={errors} attrs={attrs} standDimension={stand?.dimensao} />
        ) : (
          <CamposVisitante errors={errors} attrs={attrs} />
        )}
        <div className="sm:col-span-2">
          <label
            className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm leading-6"
            htmlFor="consentimento"
          >
            <input
              id="consentimento"
              name="consentimento"
              type="checkbox"
              required
              aria-invalid={!!errors.consentimento}
              aria-describedby={errors.consentimento ? "consentimento-error" : undefined}
              className="mt-1 h-5 w-5 shrink-0 accent-rose"
            />
            <span>
              Consinto com o uso dos dados informados para{" "}
              {exhibitor
                ? "registrar meu interesse e contato sobre o evento"
                : "registrar minha intenção de comparecer"}.
              Estou ciente de que este ambiente é uma demonstração e armazena
              os dados apenas neste navegador.
            </span>
          </label>
          {errors.consentimento && (
            <p id="consentimento-error" className="mt-2 text-sm text-danger">
              {errors.consentimento}
            </p>
          )}
        </div>
      </div>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="mt-5 text-sm text-danger">
          Revise os campos indicados para continuar.
        </p>
      )}
      {failure && (
        <p role="alert" className="mt-5 text-sm leading-6 text-danger">
          {failure}{" "}
          <a
            className="underline"
            href={EVENTO.linktree}
            target="_blank"
            rel="noopener noreferrer"
          >
            Canais oficiais ↗
          </a>
        </p>
      )}
      <button type="submit" className={submitClass}>
        {exhibitor ? "Enviar meu interesse" : "Confirmar minha presença"}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="mt-4 text-xs leading-6 text-muted">
        {exhibitor
          ? "Enviar interesse não garante reserva de estande. Negociação e confirmação são feitas pela organização."
          : "A confirmação representa intenção de comparecer. Não é ingresso."}
      </p>
    </form>
  );
}

export function ExhibitorForm() {
  const params = useSearchParams();
  return <RegistrationForm mode="expositor" standId={params.get("estande")} />;
}

export function VisitorForm() {
  return <RegistrationForm mode="visitante" />;
}
