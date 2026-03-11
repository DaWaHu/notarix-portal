export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 px-8 py-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Notarix
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Contact Us
          </h1>

          <p className="mt-3 max-w-2xl text-base text-blue-100">
            Connect with the Notarix team for demos, vendor onboarding, support,
            or partnership inquiries.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">

          <form className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                rows={5}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Send Message
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}