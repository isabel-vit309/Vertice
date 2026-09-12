import { FiShield } from 'react-icons/fi';

export default function AdmPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <FiShield aria-hidden="true" className="mb-6 text-4xl text-indigo-600" />
      <h1 className="text-3xl font-bold tracking-tight">Área administrativa</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
        Bem-vindo! Este é o espaço para administrar a plataforma.
      </p>
    </section>
  );
}
