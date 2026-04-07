import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#07100A' }}
    >
      {/* Gradiente de fondo */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="text-center space-y-8 max-w-lg">
        {/* Logo */}
        <div className="space-y-2">
          <div className="text-8xl" aria-hidden>
            🐸
          </div>
          <h1
            className="text-4xl sm:text-6xl font-black tracking-tight"
            style={{ color: '#c9a84c', fontFamily: 'serif' }}
          >
            LA RANA
          </h1>
          <p className="text-[#86a98c] font-mono text-sm tracking-widest uppercase">
            Juego de Azar Digital
          </p>
        </div>

        {/* Descripción */}
        <p className="text-[#4ade80]/70 text-base leading-relaxed">
          El clásico juego colombiano de la rana, ahora en formato digital.
          <br />
          <span className="text-[#86a98c] text-sm">RTP certificado 85% · Provably Fair · COLJUEGOS</span>
        </p>

        {/* CTA */}
        <Link
          href="/rana"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xl uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: '#c9a84c',
            color: '#07100A',
            boxShadow: '0 0 40px rgba(201,168,76,0.4)',
          }}
        >
          <span>🎯</span> Jugar Ahora
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { label: 'RTP', value: '85%', color: '#4ade80' },
            { label: 'Premio máx', value: '×15', color: '#fbbf24' },
            { label: 'Apuesta mín', value: '$500', color: '#60a5fa' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border p-3 text-center"
              style={{ borderColor: color + '30', background: color + '10' }}
            >
              <p className="font-mono font-black text-xl" style={{ color }}>
                {value}
              </p>
              <p className="text-[#86a98c] text-[10px] font-mono uppercase tracking-widest mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-[#1a3d27] text-[10px] font-mono">
          ⚠️ Jugá con responsabilidad · +18 · Modo DEMO — sin dinero real
        </p>
      </div>
    </div>
  );
}
